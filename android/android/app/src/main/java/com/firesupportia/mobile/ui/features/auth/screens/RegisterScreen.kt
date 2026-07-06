package com.firesupportia.mobile.ui.features.auth.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.firesupportia.mobile.ui.core.components.FireButton
import com.firesupportia.mobile.ui.core.components.FireTextField
import com.firesupportia.mobile.ui.core.state.UiEvent
import com.firesupportia.mobile.ui.features.auth.state.RegisterEvent
import com.firesupportia.mobile.ui.features.auth.viewmodel.RegisterViewModel
import com.firesupportia.mobile.ui.theme.OnSurfacePrimary
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand

@Composable
fun RegisterScreen(
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit,
    viewModel: RegisterViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.uiEvent.collect { event ->
            when (event) {
                is UiEvent.ShowSnackbar -> {
                    snackbarHostState.showSnackbar(event.message)
                }
                is UiEvent.Navigate -> {
                    onRegisterSuccess()
                }
                else -> Unit
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFFFDF2F2),
                            Color(0xFFF9F9FB)
                        )
                    )
                )
                .verticalScroll(rememberScrollState())
                .padding(vertical = 24.dp),
            verticalArrangement = Arrangement.Center
        ) {

        // ── Título ────────────────────────────────────────────
        Text(
            text      = "Únete a la Misión",
            style     = MaterialTheme.typography.headlineSmall.copy(
                color      = OnSurfacePrimary,
                fontWeight = FontWeight.ExtraBold
            ),
            textAlign = TextAlign.Center,
            modifier  = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text      = "Tu impacto comienza aquí.\nProtegiendo a quienes nos cuidan.",
            style     = MaterialTheme.typography.bodySmall.copy(
                color = OnSurfaceVariantBrand
            ),
            textAlign = TextAlign.Center,
            modifier  = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Línea decorativa central
        Box(
            modifier = Modifier
                .width(32.dp)
                .height(3.dp)
                .background(PrimaryBrand, RoundedCornerShape(2.dp))
                .align(Alignment.CenterHorizontally)
        )

        Spacer(modifier = Modifier.height(24.dp))

        // ── Card del formulario ───────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .background(Color.White, RoundedCornerShape(16.dp))
                .padding(22.dp)
        ) {

            // Nombre completo
            FireTextField(
                label = "Nombre Completo",
                value = uiState.name,
                onValueChange = { viewModel.onEvent(RegisterEvent.OnNameChanged(it)) },
                placeholder = "Ej. Juan Pérez",
                leadingIcon = Icons.Outlined.Person,
                error = uiState.nameError,
                imeAction = ImeAction.Next
            )

            Spacer(modifier = Modifier.height(18.dp))

            // Correo electrónico
            FireTextField(
                label = "Correo Electrónico",
                value = uiState.email,
                onValueChange = { viewModel.onEvent(RegisterEvent.OnEmailChanged(it)) },
                placeholder = "nombre@dominio.com",
                leadingIcon = Icons.Outlined.Email,
                error = uiState.emailError,
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next
            )

            Spacer(modifier = Modifier.height(18.dp))

            // Contraseña
            FireTextField(
                label = "Contraseña",
                value = uiState.password,
                onValueChange = { viewModel.onEvent(RegisterEvent.OnPasswordChanged(it)) },
                placeholder = "••••••••",
                leadingIcon = Icons.Outlined.Lock,
                isPassword = true,
                error = uiState.passwordError,
                imeAction = ImeAction.Next
            )

            Spacer(modifier = Modifier.height(18.dp))

            // Confirmar contraseña
            FireTextField(
                label = "Confirmar Contraseña",
                value = uiState.confirmPassword,
                onValueChange = { viewModel.onEvent(RegisterEvent.OnConfirmPasswordChanged(it)) },
                placeholder = "••••••••",
                leadingIcon = Icons.Outlined.Shield,
                isPassword = true,
                error = uiState.confirmPasswordError,
                imeAction = ImeAction.Done
            )

            Spacer(modifier = Modifier.height(18.dp))

            // Checkbox términos
            Column {
                Row(verticalAlignment = Alignment.Top) {
                    Checkbox(
                        checked = uiState.isTermsAccepted,
                        onCheckedChange = { viewModel.onEvent(RegisterEvent.OnTermsAcceptedChanged(it)) },
                        colors = CheckboxDefaults.colors(
                            checkedColor = PrimaryBrand
                        )
                    )
                    Text(
                        text = buildAnnotatedString {
                            append("Acepto los ")
                            withStyle(
                                SpanStyle(
                                    color = PrimaryBrand,
                                    fontWeight = FontWeight.SemiBold
                                )
                            ) { append("Términos y Condiciones") }
                            append(" y la Política de Privacidad de FireSupport IA.")
                        },
                        style = MaterialTheme.typography.labelMedium.copy(
                            color = OnSurfacePrimary
                        ),
                        modifier = Modifier.padding(top = 12.dp)
                    )
                }
                if (uiState.termsError != null) {
                    Text(
                        text = uiState.termsError!!,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier.padding(start = 12.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // ── Botón Crear cuenta de Héroe ───────────────────────
        FireButton(
            text = "Crear cuenta de Héroe",
            icon = Icons.Filled.Bolt,
            loading = uiState.isLoading,
            onClick = { viewModel.onEvent(RegisterEvent.OnRegisterClicked) },
            modifier = Modifier.padding(horizontal = 20.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // ── Link iniciar sesión ───────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = "¿Ya eres parte? ",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = OnSurfacePrimary
                )
            )
            Text(
                text = "Iniciar sesión",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = PrimaryBrand,
                    fontWeight = FontWeight.SemiBold
                ),
                modifier = Modifier.clickable { onNavigateToLogin() }
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // ── Footer ────────────────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Outlined.Shield,
                contentDescription = null,
                tint = OnSurfaceVariantBrand,
                modifier = Modifier.size(12.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "SECURE FOUNDATION V4.0",
                style = MaterialTheme.typography.labelSmall.copy(
                    color = OnSurfaceVariantBrand
                )
            )
        }
    }
}
}
