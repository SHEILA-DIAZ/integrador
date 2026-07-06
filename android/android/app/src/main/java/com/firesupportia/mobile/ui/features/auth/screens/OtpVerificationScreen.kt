package com.firesupportia.mobile.ui.features.auth.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.firesupportia.mobile.ui.core.components.FireButton
import com.firesupportia.mobile.ui.core.state.UiEvent
import com.firesupportia.mobile.ui.features.auth.state.OtpEvent
import com.firesupportia.mobile.ui.features.auth.viewmodel.OtpViewModel
import com.firesupportia.mobile.ui.theme.CardInactiveBorder
import com.firesupportia.mobile.ui.theme.OnSurfacePrimary
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand

@Composable
fun OtpVerificationScreen(
    onNavigateBack: () -> Unit,
    onCodeVerified: () -> Unit,
    viewModel: OtpViewModel = hiltViewModel()
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
                    onCodeVerified()
                }
                else -> Unit
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Box(
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
        ) {
        // ── Botón atrás ───────────────────────────────────────
        IconButton(
            onClick = onNavigateBack,
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(top = 16.dp, start = 8.dp)
        ) {
            Icon(
                imageVector = Icons.Filled.ArrowBack,
                contentDescription = "Volver",
                tint = OnSurfacePrimary
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // ── Card principal ────────────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(16.dp))
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Ícono correo
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .background(Color(0xFFF5E8E8), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Email,
                        contentDescription = null,
                        tint = PrimaryBrand,
                        modifier = Modifier.size(28.dp)
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Título
                Text(
                    text = "Verifica tu correo",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        color = OnSurfacePrimary,
                        fontWeight = FontWeight.ExtraBold
                    ),
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Subtítulo
                Text(
                    text = "Hemos enviado un código de 4 dígitos a tu email",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = OnSurfaceVariantBrand
                    ),
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(24.dp))

                // ── 4 cajas de dígito ──────────────────────────
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally)
                ) {
                    OtpDigitField(value = uiState.digit1, onValueChange = { viewModel.onEvent(OtpEvent.OnDigitChanged(0, it)) })
                    OtpDigitField(value = uiState.digit2, onValueChange = { viewModel.onEvent(OtpEvent.OnDigitChanged(1, it)) })
                    OtpDigitField(value = uiState.digit3, onValueChange = { viewModel.onEvent(OtpEvent.OnDigitChanged(2, it)) })
                    OtpDigitField(value = uiState.digit4, onValueChange = { viewModel.onEvent(OtpEvent.OnDigitChanged(3, it)) })
                }

                Spacer(modifier = Modifier.height(20.dp))

                // ── Reenviar código ────────────────────────────
                Text(
                    text = "Reenviar código ahora",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = PrimaryBrand,
                        fontWeight = FontWeight.SemiBold
                    ),
                    modifier = Modifier.clickable { viewModel.onEvent(OtpEvent.OnResendCodeClicked) }
                )

                Spacer(modifier = Modifier.height(20.dp))

                // ── Botón Verificar ────────────────────────────
                FireButton(
                    text = "Verificar",
                    icon = Icons.Filled.ArrowForward,
                    enabled = uiState.isOtpComplete,
                    loading = uiState.isLoading,
                    onClick = { viewModel.onEvent(OtpEvent.OnVerifyClicked) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // ── Aviso spam ──────────────────────────────────
                Text(
                    text = "Si no recibiste el correo, revisa tu carpeta de spam o correo no deseado.",
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = OnSurfaceVariantBrand
                    ),
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}
}

@Composable
private fun OtpDigitField(
    value: String,
    onValueChange: (String) -> Unit
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier
            .width(46.dp)
            .height(54.dp),
        shape = RoundedCornerShape(10.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = PrimaryBrand,
            unfocusedBorderColor = CardInactiveBorder,
            unfocusedContainerColor = Color(0xFFF7F7F9),
            focusedContainerColor = Color(0xFFF7F7F9)
        ),
        textStyle = TextStyle(
            textAlign = TextAlign.Center,
            fontSize = MaterialTheme.typography.titleLarge.fontSize,
            color = OnSurfacePrimary
        ),
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
    )
}
