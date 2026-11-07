// Inicio de sesión del conductor.
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/forms/InputField';
import { colors, radius, spacing, typography } from '../../theme';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login, isDemo, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 6;

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    setFormError(null);
    clearError?.();

    if (!emailValid) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!passwordValid) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (loginError) {
      setFormError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleError = formError || authError;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoBadge}>
          <Ionicons name="car-sport" size={44} color={colors.textInverse} />
        </View>

        <Text style={styles.title}>ViaMax Conductor</Text>
        <Text style={styles.subtitle}>
          Inicia sesión para recibir viajes y gestionar tus ganancias.
        </Text>

        {isDemo ? (
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.demoText}>
              Modo local activo. Configura Firebase en el archivo .env para conectar la nube.
            </Text>
          </View>
        ) : null}

        {visibleError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{visibleError}</Text>
          </View>
        ) : null}

        <InputField
          label="Correo Electrónico"
          placeholder="conductor@viamax.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setTouched((prev) => ({ ...prev, email: true }));
          }}
          error={touched.email && !emailValid ? 'Ingresa un correo válido' : null}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />

        <InputField
          label="Contraseña"
          placeholder="Tu contraseña"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setTouched((prev) => ({ ...prev, password: true }));
          }}
          error={touched.password && !passwordValid ? 'Mínimo 6 caracteres' : null}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Iniciar sesión"
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Registration')}
          accessibilityRole="button"
        >
          <Text style={styles.registerLinkText}>
            ¿No tienes cuenta? <Text style={styles.registerLinkHighlight}>Regístrate</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Al continuar aceptas los términos y condiciones y la política de tratamiento de datos
          de ViaMax.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 30,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: spacing.xl,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  demoText: {
    color: colors.warning,
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: spacing.sm,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '800',
  },
  registerLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  registerLinkText: {
    color: colors.textSoft,
    fontSize: 14,
  },
  registerLinkHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  legalText: {
    color: colors.textSoft,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.xxl,
    lineHeight: 16,
    opacity: 0.8,
  },
});
