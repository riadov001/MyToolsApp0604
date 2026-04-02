import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Switch,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { ThemeColors } from "@/constants/theme";
import { useCustomAlert } from "@/components/CustomAlert";
import { getBackendUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Step = "siret" | "form" | "success";

interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  siret: string;
  siren: string;
  legalForm: string;
  tvaNumber: string;
}

export default function GarageRegisterScreen() {
  const params = useLocalSearchParams();
  const prefillEmail = Array.isArray(params.email) ? params.email[0] : (params.email as string || "");
  const prefillName = Array.isArray(params.displayName) ? params.displayName[0] : (params.displayName as string || "");
  const firebaseUid = Array.isArray(params.firebaseUid) ? params.firebaseUid[0] : (params.firebaseUid as string || "");
  const idToken = Array.isArray(params.idToken) ? params.idToken[0] : (params.idToken as string || "");
  const isGoogleFlow = !!firebaseUid;

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { showAlert, AlertComponent } = useCustomAlert();
  const { socialLogin } = useAuth();

  const [step, setStep] = useState<Step>("siret");
  const [loading, setLoading] = useState(false);

  const [siretInput, setSiretInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const siretLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [suggestions, setSuggestions] = useState<CompanyInfo[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualSiret, setManualSiret] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualPostalCode, setManualPostalCode] = useState("");
  const [manualCity, setManualCity] = useState("");

  const nameParts = prefillName.split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [garageName, setGarageName] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const apiBase = getBackendUrl();
  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 34 + 24 : insets.bottom + 24;

  const parseCompanyData = useCallback((data: any, fallbackQuery?: string): CompanyInfo => ({
    name: data.name || data.companyName || data.denominationUniteLegale || "",
    address: data.address || data.adresseEtablissement || "",
    city: data.city || data.libelleCommuneEtablissement || "",
    postalCode: data.postalCode || data.codePostalEtablissement || "",
    siret: data.siret || fallbackQuery || "",
    siren: data.siren || (data.siret ? data.siret.slice(0, 9) : ""),
    legalForm: data.legalForm || data.categorieJuridiqueUniteLegale || "",
    tvaNumber: data.tvaNumber || "",
  }), []);

  const doLookup = useCallback(async (query: string, mode: "siret" | "siren") => {
    setLoading(true);
    setSuggestions([]);
    try {
      const param = mode === "siren" ? `siren=${encodeURIComponent(query)}` : `siret=${encodeURIComponent(query)}`;
      const res = await fetch(`${apiBase}/api/mobile/public/siret-lookup?${param}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Entreprise introuvable");
      }
      const data = await res.json();
      const items: any[] = Array.isArray(data) ? data : (data.results || data.companies || data.etablissements || [data]);
      if (items.length > 1) {
        setSuggestions(items.map((d) => parseCompanyData(d)));
      } else {
        const co = parseCompanyData(items[0] ?? data, query);
        setCompany(co);
        if (!garageName && co.name) setGarageName(co.name);
      }
    } catch (err: any) {
      showAlert({ type: "error", title: "Introuvable", message: err.message || "Impossible de trouver l'établissement.", buttons: [{ text: "OK", style: "primary" }] });
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [garageName, apiBase, parseCompanyData]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`${apiBase}/api/mobile/public/siret-lookup?name=${encodeURIComponent(query)}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) { setSuggestions([]); return; }
      const data = await res.json();
      const items: any[] = Array.isArray(data)
        ? data
        : (data.results || data.companies || data.etablissements || (data.name || data.companyName ? [data] : []));
      setSuggestions(items.map((d) => parseCompanyData(d)).filter((c) => c.name));
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [apiBase, parseCompanyData]);

  const handleSiretChange = useCallback((text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 14);
    setSiretInput(digits);
    setCompany(null);
    setSuggestions([]);
    setNameInput("");
    if (siretLookupTimer.current) clearTimeout(siretLookupTimer.current);
    if (digits.length === 14) {
      siretLookupTimer.current = setTimeout(() => doLookup(digits, "siret"), 400);
    } else if (digits.length === 9) {
      siretLookupTimer.current = setTimeout(() => doLookup(digits, "siren"), 400);
    }
  }, [doLookup]);

  const handleNameChange = useCallback((text: string) => {
    setNameInput(text);
    setSiretInput("");
    setCompany(null);
    if (nameLookupTimer.current) clearTimeout(nameLookupTimer.current);
    if (text.length >= 3) {
      nameLookupTimer.current = setTimeout(() => fetchSuggestions(text), 500);
    } else {
      setSuggestions([]);
    }
  }, [fetchSuggestions]);

  const selectSuggestion = useCallback((item: CompanyInfo) => {
    setCompany(item);
    setSuggestions([]);
    setNameInput(item.name);
    if (!garageName) setGarageName(item.name);
  }, [garageName]);

  const lookupManual = useCallback(async () => {
    const query = siretInput.trim() || nameInput.trim();
    if (!query) {
      showAlert({ type: "error", title: "Erreur", message: "Veuillez saisir un SIRET, SIREN ou un nom d'entreprise.", buttons: [{ text: "OK", style: "primary" }] });
      return;
    }
    if (siretInput.trim()) {
      const digits = siretInput.trim();
      if (digits.length === 9) await doLookup(digits, "siren");
      else if (digits.length === 14) await doLookup(digits, "siret");
      else showAlert({ type: "error", title: "Format invalide", message: "Saisissez un SIRET (14 chiffres) ou un SIREN (9 chiffres).", buttons: [{ text: "OK", style: "primary" }] });
    } else {
      await fetchSuggestions(nameInput.trim());
    }
  }, [siretInput, nameInput, doLookup, fetchSuggestions]);

  const confirmManualEntry = useCallback(() => {
    const siretClean = manualSiret.replace(/\D/g, "");
    if (siretClean.length !== 14) {
      showAlert({ type: "error", title: "SIRET invalide", message: "Le numéro SIRET doit contenir exactement 14 chiffres.", buttons: [{ text: "OK", style: "primary" }] });
      return;
    }
    if (!manualName.trim()) {
      showAlert({ type: "error", title: "Champ requis", message: "La raison sociale est obligatoire.", buttons: [{ text: "OK", style: "primary" }] });
      return;
    }
    if (!manualAddress.trim()) {
      showAlert({ type: "error", title: "Champ requis", message: "L'adresse est obligatoire.", buttons: [{ text: "OK", style: "primary" }] });
      return;
    }
    const co: CompanyInfo = {
      name: manualName.trim(),
      address: manualAddress.trim(),
      city: manualCity.trim(),
      postalCode: manualPostalCode.trim(),
      siret: siretClean,
      siren: siretClean.slice(0, 9),
      legalForm: "",
      tvaNumber: "",
    };
    setCompany(co);
    if (!garageName) setGarageName(co.name);
    setManualMode(false);
  }, [manualSiret, manualName, manualAddress, manualCity, manualPostalCode, garageName]);

  const checkEmailAndProceed = useCallback(async () => {
    if (!company) return;
    setStep("form");
  }, [company]);

  const handleRegister = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert({ type: "error", title: "Erreur", message: "Prénom et nom requis.", buttons: [{ text: "OK", style: "primary" }] });
      return;
    }
    if (!email.trim()) {
      showAlert({ type: "error", title: "Erreur", message: "Email requis.", buttons: [{ text: "OK", style: "primary" }] });
      return;
    }
    if (!isGoogleFlow) {
      if (!password || password.length < 8) {
        showAlert({ type: "error", title: "Erreur", message: "Le mot de passe doit contenir au moins 8 caractères.", buttons: [{ text: "OK", style: "primary" }] });
        return;
      }
      if (password !== confirmPassword) {
        showAlert({ type: "error", title: "Erreur", message: "Les mots de passe ne correspondent pas.", buttons: [{ text: "OK", style: "primary" }] });
        return;
      }
    }
    if (!legalConsent) {
      showAlert({ type: "error", title: "Erreur", message: "Vous devez accepter les conditions générales.", buttons: [{ text: "OK", style: "primary" }] });
      return;
    }

    setLoading(true);
    try {
      const checkRes = await fetch(`${apiBase}/api/users/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
        headers: { Accept: "application/json" },
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData?.exists) {
          showAlert({ type: "info", title: "Compte existant", message: "Un compte existe déjà avec cette adresse email. Veuillez vous connecter.", buttons: [{ text: "Se connecter", style: "primary", onPress: () => router.replace("/(auth)/login") }] });
          setLoading(false);
          return;
        }
      }

      const body: any = {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        garageName: garageName.trim() || company?.name || "",
        companyName: company?.name || "",
        siret: company?.siret || "",
        siren: company?.siren || "",
        address: company?.address || "",
        city: company?.city || "",
        postalCode: company?.postalCode || "",
        tvaNumber: company?.tvaNumber || "",
        legalForm: company?.legalForm || "",
        smsConsent,
      };
      if (isGoogleFlow) {
        body.firebaseUid = firebaseUid;
      } else {
        body.password = password;
      }

      const res = await fetch(`${apiBase}/api/mobile/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[Register] API error:", res.status, JSON.stringify(err));
        throw new Error(err?.message || err?.error || "Inscription échouée. Veuillez réessayer.");
      }

      if (isGoogleFlow && idToken) {
        try {
          const loginResult = await socialLogin(idToken, "google");
          if (loginResult.status === "authenticated") {
            setStep("success");
            return;
          }
          showAlert({
            type: "info",
            title: "Compte créé",
            message: "Votre compte a été créé avec succès. Veuillez vous connecter.",
            buttons: [{ text: "Se connecter", style: "primary", onPress: () => router.replace("/(auth)/login") }],
          });
          setLoading(false);
          return;
        } catch (loginErr: any) {
          console.error("[Register] Auto-login after registration failed:", loginErr.message);
          showAlert({
            type: "info",
            title: "Compte créé",
            message: "Votre compte a été créé avec succès. Veuillez vous connecter.",
            buttons: [{ text: "Se connecter", style: "primary", onPress: () => router.replace("/(auth)/login") }],
          });
          setLoading(false);
          return;
        }
      }

      setStep("success");
    } catch (err: any) {
      showAlert({ type: "error", title: "Erreur", message: err.message || "Inscription échouée.", buttons: [{ text: "OK", style: "primary" }] });
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, password, confirmPassword, garageName, smsConsent, legalConsent, company, firebaseUid, isGoogleFlow, idToken, socialLogin, apiBase]);

  const renderCompanyCard = (co: CompanyInfo, onConfirm: () => void) => (
    <View style={styles.companyCard}>
      <Text style={styles.companyName}>{co.name}</Text>
      {!!co.address && (
        <View style={styles.companyRow}>
          <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
          <Text style={styles.companyDetail}>{co.address}{co.postalCode || co.city ? `, ${co.postalCode} ${co.city}` : ""}</Text>
        </View>
      )}
      {!!co.siret && (
        <View style={styles.companyRow}>
          <Ionicons name="document-text-outline" size={14} color={theme.textSecondary} />
          <Text style={styles.companyDetail}>SIRET : {co.siret}</Text>
        </View>
      )}
      {!co.siret && !!co.siren && (
        <View style={styles.companyRow}>
          <Ionicons name="document-text-outline" size={14} color={theme.textSecondary} />
          <Text style={styles.companyDetail}>SIREN : {co.siren}</Text>
        </View>
      )}
      {!!co.tvaNumber && (
        <View style={styles.companyRow}>
          <Ionicons name="receipt-outline" size={14} color={theme.textSecondary} />
          <Text style={styles.companyDetail}>TVA : {co.tvaNumber}</Text>
        </View>
      )}
      {!!co.legalForm && (
        <View style={styles.companyRow}>
          <Ionicons name="briefcase-outline" size={14} color={theme.textSecondary} />
          <Text style={styles.companyDetail}>{co.legalForm}</Text>
        </View>
      )}
      <Pressable style={styles.confirmBtn} onPress={onConfirm}>
        <Ionicons name="checkmark-circle" size={18} color="#fff" />
        <Text style={styles.confirmBtnText}>C'est mon entreprise</Text>
      </Pressable>
    </View>
  );

  const renderSiretStep = () => (
    <>
      <View style={styles.stepHeader}>
        <View style={[styles.stepIcon, { backgroundColor: theme.primary + "20" }]}>
          <Ionicons name="business-outline" size={28} color={theme.primary} />
        </View>
        <Text style={styles.stepTitle}>Recherche d'entreprise</Text>
        <Text style={styles.stepDesc}>
          Recherchez votre garage par SIRET, SIREN ou raison sociale.{"\n"}France uniquement.
        </Text>
      </View>

      {isGoogleFlow && (
        <View style={[styles.companyBadge, { backgroundColor: "#10B98115", marginBottom: 16 }]}>
          <Ionicons name="logo-google" size={16} color="#10B981" />
          <Text style={[styles.companyBadgeText, { color: "#10B981" }]}>
            Connecté via Google ({prefillEmail})
          </Text>
        </View>
      )}

      {!manualMode ? (
        <>
          <Text style={styles.label}>Numéro SIRET / SIREN</Text>
          <TextInput
            style={styles.input}
            value={siretInput}
            onChangeText={handleSiretChange}
            placeholder="14 chiffres (SIRET) ou 9 chiffres (SIREN)"
            placeholderTextColor={theme.textTertiary}
            keyboardType="number-pad"
            maxLength={14}
            autoCapitalize="none"
          />
          {siretInput.length > 0 && siretInput.length !== 9 && siretInput.length !== 14 && (
            <Text style={styles.siretHint}>
              {siretInput.length}/14 — {siretInput.length < 9 ? `encore ${9 - siretInput.length} chiffres pour SIREN` : `encore ${14 - siretInput.length} chiffres pour SIRET`}
            </Text>
          )}
          {siretInput.length === 9 && !loading && !company && (
            <Text style={[styles.siretHint, { color: "#F59E0B" }]}>SIREN détecté — recherche en cours…</Text>
          )}

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>ou</Text>
            <View style={styles.orLine} />
          </View>

          <Text style={styles.label}>Raison sociale</Text>
          <View style={{ position: "relative" }}>
            <View style={styles.nameInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={nameInput}
                onChangeText={handleNameChange}
                placeholder="Ex: Garage du Centre"
                placeholderTextColor={theme.textTertiary}
                autoCapitalize="words"
              />
              {loadingSuggestions && (
                <ActivityIndicator size="small" color={theme.primary} style={{ position: "absolute", right: 14, top: 14 }} />
              )}
            </View>

            {suggestions.length > 0 && !company && (
              <View style={styles.suggestionList}>
                {suggestions.map((item, idx) => (
                  <Pressable
                    key={`${item.siret || item.siren}-${idx}`}
                    style={({ pressed }) => [
                      styles.suggestionItem,
                      idx < suggestions.length - 1 && styles.suggestionDivider,
                      pressed && { backgroundColor: theme.primary + "12" },
                    ]}
                    onPress={() => selectSuggestion(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
                      {!!item.city && (
                        <Text style={styles.suggestionSub} numberOfLines={1}>
                          {item.postalCode} {item.city}{item.siret ? ` · ${item.siret}` : ""}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
                  </Pressable>
                ))}
              </View>
            )}
            {nameInput.length >= 3 && !loadingSuggestions && suggestions.length === 0 && !company && (
              <Text style={[styles.siretHint, { marginTop: 4 }]}>Aucun résultat — essayez un autre terme ou saisissez manuellement.</Text>
            )}
          </View>

          <Pressable
            style={[styles.primaryBtn, (loading || loadingSuggestions) && { opacity: 0.6 }]}
            onPress={lookupManual}
            disabled={loading || loadingSuggestions}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="search" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Rechercher</Text>
              </>
            )}
          </Pressable>

          {company && renderCompanyCard(company, checkEmailAndProceed)}

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>vous ne trouvez pas ?</Text>
            <View style={styles.orLine} />
          </View>

          <Pressable style={styles.manualBtn} onPress={() => { setManualMode(true); setCompany(null); setSuggestions([]); }}>
            <Ionicons name="create-outline" size={16} color={theme.primary} />
            <Text style={styles.manualBtnText}>Saisir manuellement</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={[styles.companyBadge, { backgroundColor: "#F59E0B15", marginBottom: 16 }]}>
            <Ionicons name="create-outline" size={16} color="#F59E0B" />
            <Text style={[styles.companyBadgeText, { color: "#F59E0B" }]}>Saisie manuelle — tous les champs marqués * sont requis</Text>
          </View>

          <Text style={styles.label}>SIRET * <Text style={styles.labelHint}>(14 chiffres)</Text></Text>
          <TextInput
            style={[styles.input, manualSiret.replace(/\D/g, "").length > 0 && manualSiret.replace(/\D/g, "").length !== 14 && { borderColor: "#EF4444" }]}
            value={manualSiret}
            onChangeText={(t) => setManualSiret(t.replace(/\D/g, "").slice(0, 14))}
            placeholder="12345678901234"
            placeholderTextColor={theme.textTertiary}
            keyboardType="number-pad"
            maxLength={14}
          />
          {manualSiret.length > 0 && manualSiret.length !== 14 && (
            <Text style={[styles.siretHint, { color: "#EF4444" }]}>{manualSiret.length}/14 chiffres — SIRET incomplet</Text>
          )}

          <Text style={styles.label}>Raison sociale *</Text>
          <TextInput
            style={styles.input}
            value={manualName}
            onChangeText={setManualName}
            placeholder="Ex: Garage du Centre SARL"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Adresse *</Text>
          <TextInput
            style={styles.input}
            value={manualAddress}
            onChangeText={setManualAddress}
            placeholder="Ex: 12 rue de la Paix"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="words"
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Code postal</Text>
              <TextInput
                style={styles.input}
                value={manualPostalCode}
                onChangeText={(t) => setManualPostalCode(t.replace(/\D/g, "").slice(0, 5))}
                placeholder="75001"
                placeholderTextColor={theme.textTertiary}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Ville</Text>
              <TextInput
                style={styles.input}
                value={manualCity}
                onChangeText={setManualCity}
                placeholder="Paris"
                placeholderTextColor={theme.textTertiary}
                autoCapitalize="words"
              />
            </View>
          </View>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 8 }]}
            onPress={confirmManualEntry}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Valider l'entreprise</Text>
          </Pressable>

          <Pressable style={styles.backStepBtn} onPress={() => setManualMode(false)}>
            <Ionicons name="arrow-back" size={16} color={theme.textSecondary} />
            <Text style={styles.backStepText}>Retour à la recherche</Text>
          </Pressable>

          {company && renderCompanyCard(company, checkEmailAndProceed)}
        </>
      )}
    </>
  );

  const renderFormStep = () => (
    <>
      <View style={styles.stepHeader}>
        <View style={[styles.stepIcon, { backgroundColor: "#10B98120" }]}>
          <Ionicons name="person-outline" size={28} color="#10B981" />
        </View>
        <Text style={styles.stepTitle}>Vos informations</Text>
        <Text style={styles.stepDesc}>
          {isGoogleFlow
            ? "Complétez les informations de votre garage."
            : "Complétez vos informations pour créer votre compte garage."}
        </Text>
      </View>

      {isGoogleFlow && (
        <View style={[styles.companyBadge, { backgroundColor: "#10B98115", marginBottom: 12 }]}>
          <Ionicons name="logo-google" size={16} color="#10B981" />
          <Text style={[styles.companyBadgeText, { color: "#10B981" }]}>
            Connecté via Google — aucun mot de passe requis
          </Text>
        </View>
      )}

      {company && (
        <View style={styles.companyBadge}>
          <Ionicons name="business" size={16} color={theme.primary} />
          <Text style={styles.companyBadgeText}>{company.name}</Text>
        </View>
      )}

      <Text style={styles.label}>Nom du garage</Text>
      <TextInput
        style={styles.input}
        value={garageName}
        onChangeText={setGarageName}
        placeholder="Nom affiché pour vos clients"
        placeholderTextColor={theme.textTertiary}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Jean"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="words"
            editable={!isGoogleFlow || !nameParts[0]}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Dupont"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="words"
            editable={!isGoogleFlow || !nameParts.slice(1).join(" ")}
          />
        </View>
      </View>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, isGoogleFlow && { opacity: 0.7, backgroundColor: theme.surface }]}
        value={email}
        onChangeText={setEmail}
        placeholder="contact@garage.com"
        placeholderTextColor={theme.textTertiary}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={!isGoogleFlow}
      />

      {!isGoogleFlow && (
        <>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="8 caractères minimum"
              placeholderTextColor={theme.textTertiary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={theme.textTertiary} />
            </Pressable>
          </View>

          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmez votre mot de passe"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
        </>
      )}

      <View style={styles.switchRow}>
        <Switch
          value={smsConsent}
          onValueChange={setSmsConsent}
          trackColor={{ false: theme.border, true: theme.primary + "60" }}
          thumbColor={smsConsent ? theme.primary : theme.textTertiary}
        />
        <Text style={styles.switchLabel}>J'accepte de recevoir des SMS</Text>
      </View>

      <Pressable style={styles.checkboxRow} onPress={() => setLegalConsent(!legalConsent)}>
        <View style={[styles.checkbox, legalConsent && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
          {legalConsent && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
        <Text style={styles.checkboxLabel}>
          J'accepte les{" "}
          <Text style={{ color: theme.primary }} onPress={() => router.push("/legal" as any)}>
            conditions générales
          </Text>
          {" "}et la{" "}
          <Text style={{ color: theme.primary }} onPress={() => router.push("/privacy" as any)}>
            politique de confidentialité
          </Text>
        </Text>
      </Pressable>

      <Pressable
        style={[styles.primaryBtn, (loading || !legalConsent) && { opacity: 0.6 }]}
        onPress={handleRegister}
        disabled={loading || !legalConsent}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="rocket-outline" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Créer mon compte</Text>
          </>
        )}
      </Pressable>

      <Pressable style={styles.backStepBtn} onPress={() => setStep("siret")}>
        <Ionicons name="arrow-back" size={16} color={theme.textSecondary} />
        <Text style={styles.backStepText}>Modifier l'entreprise</Text>
      </Pressable>
    </>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={[styles.stepIcon, { backgroundColor: "#10B98120", width: 80, height: 80, borderRadius: 24 }]}>
        <Ionicons name={isGoogleFlow ? "checkmark-circle-outline" : "mail-outline"} size={40} color="#10B981" />
      </View>
      <Text style={styles.successTitle}>
        {isGoogleFlow ? "Inscription réussie !" : "Vérifiez votre email"}
      </Text>
      <Text style={styles.successDesc}>
        {isGoogleFlow ? (
          <>
            Votre compte garage a été créé avec succès.{"\n\n"}
            Vous pouvez maintenant vous connecter avec Google.
          </>
        ) : (
          <>
            Un email de vérification a été envoyé à{"\n"}
            <Text style={{ fontFamily: "Inter_600SemiBold", color: theme.text }}>{email}</Text>
            {"\n\n"}
            Cliquez sur le lien dans l'email pour activer votre compte, puis connectez-vous.
          </>
        )}
      </Text>
      <Pressable style={styles.primaryBtn} onPress={() => router.replace("/(auth)/login")}>
        <Ionicons name="log-in-outline" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>Aller à la connexion</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Pressable style={styles.backBtn} onPress={() => step === "form" ? setStep("siret") : router.back()} accessibilityLabel="Retour">
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {step === "siret" ? "Inscription garage" : step === "form" ? "Vos informations" : "Inscription"}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {step === "siret" && (
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>
      )}
      {step === "form" && (
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>
      )}
      {step === "success" && (
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === "siret" && renderSiretStep()}
          {step === "form" && renderFormStep()}
          {step === "success" && renderSuccessStep()}
        </ScrollView>
      </KeyboardAvoidingView>
      {AlertComponent}
    </View>
  );
}

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: theme.text },
  stepIndicator: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingHorizontal: 60, paddingBottom: 16, gap: 0,
  },
  stepDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: theme.surface, borderWidth: 2, borderColor: theme.border,
  },
  stepDotActive: { borderColor: theme.primary, backgroundColor: theme.primary },
  stepDotDone: { borderColor: "#10B981", backgroundColor: "#10B981" },
  stepLine: { flex: 1, height: 2, backgroundColor: theme.border },
  stepLineDone: { backgroundColor: "#10B981" },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  stepHeader: { alignItems: "center", gap: 10, marginBottom: 24 },
  stepIcon: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },
  stepTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: theme.text },
  stepDesc: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: theme.textSecondary,
    textAlign: "center", lineHeight: 20,
  },
  label: {
    fontSize: 13, fontFamily: "Inter_600SemiBold", color: theme.textSecondary,
    marginBottom: 6, marginTop: 12,
  },
  input: {
    backgroundColor: theme.surface, borderRadius: 12,
    borderWidth: 1, borderColor: theme.border,
    paddingHorizontal: 14, height: 48,
    fontSize: 15, fontFamily: "Inter_400Regular", color: theme.text,
    marginBottom: 4,
  },
  siretHint: {
    fontSize: 11, fontFamily: "Inter_400Regular", color: theme.textTertiary,
    marginTop: 2, marginLeft: 4,
  },
  orRow: { flexDirection: "row", alignItems: "center", marginVertical: 12, gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: theme.border },
  orText: { fontSize: 12, fontFamily: "Inter_500Medium", color: theme.textTertiary },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: theme.primary, borderRadius: 14,
    height: 52, marginTop: 20,
  },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  companyCard: {
    backgroundColor: theme.surface, borderRadius: 14,
    borderWidth: 1, borderColor: theme.primary + "40",
    padding: 16, marginTop: 20, gap: 8,
  },
  companyName: { fontSize: 16, fontFamily: "Inter_700Bold", color: theme.text },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  companyDetail: { fontSize: 13, fontFamily: "Inter_400Regular", color: theme.textSecondary, flex: 1 },
  confirmBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#10B981", borderRadius: 12,
    height: 46, marginTop: 8,
  },
  confirmBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  row: { flexDirection: "row", gap: 12 },
  companyBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: theme.primary + "15", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8,
  },
  companyBadgeText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: theme.primary },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 12 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  switchLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: theme.text, flex: 1 },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: theme.border,
    justifyContent: "center", alignItems: "center", marginTop: 2,
  },
  checkboxLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: theme.text, flex: 1, lineHeight: 20 },
  backStepBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 16, paddingVertical: 10,
  },
  backStepText: { fontSize: 14, fontFamily: "Inter_500Medium", color: theme.textSecondary },
  successContainer: { alignItems: "center", paddingTop: 40, gap: 16 },
  successTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: theme.text },
  successDesc: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: theme.textSecondary,
    textAlign: "center", lineHeight: 22, paddingHorizontal: 10,
  },
  nameInputRow: { flexDirection: "row", alignItems: "center" },
  suggestionList: {
    backgroundColor: theme.surface, borderRadius: 12,
    borderWidth: 1, borderColor: theme.primary + "40",
    marginTop: 4, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  suggestionItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  suggestionDivider: { borderBottomWidth: 1, borderBottomColor: theme.border },
  suggestionName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: theme.text },
  suggestionSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: theme.textSecondary, marginTop: 2 },
  manualBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: theme.primary, borderRadius: 14,
    height: 48, marginBottom: 8,
  },
  manualBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: theme.primary },
  labelHint: { fontSize: 11, fontFamily: "Inter_400Regular", color: theme.textTertiary, fontWeight: "normal" },
});
