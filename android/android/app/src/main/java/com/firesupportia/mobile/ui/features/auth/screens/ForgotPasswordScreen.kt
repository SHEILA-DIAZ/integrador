package com.firesupportia.mobile.ui.features.auth.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.LocalFireDepartment
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.firesupportia.mobile.ui.core.components.FireButton
import com.firesupportia.mobile.ui.core.components.FireTextField
import com.firesupportia.mobile.ui.core.state.UiEvent
import com.firesupportia.mobile.ui.features.auth.state.ForgotPasswordEvent
import com.firesupportia.mobile.ui.features.auth.viewmodel.ForgotPasswordViewModel
import com.firesupportia.mobile.ui.theme.CardInactiveBorder
import com.firesupportia.mobile.ui.theme.OnSurfacePrimary
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand

@Composable
fun ForgotPasswordScreen(
    onNavigateBack: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: ForgotPasswordViewModel = hiltViewModel()
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
                    onNavigateToLogin()
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
                    // Ícono llama
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .background(Color(0xFFF5E8E8), RoundedCornerShape(16.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.LocalFireDepartment,
                            contentDescription = null,
                            tint = PrimaryBrand,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Título
                    Text(
                        text = "¿Olvidaste tu contraseña?",
                        style = MaterialTheme.typography.headlineSmall.copy(
                            color = OnSurfacePrimary,
                            fontWeight = FontWeight.ExtraBold
                        ),
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Subtítulo
                    Text(
                        text = "No te preocupes. Ingresa el correo electrónico asociado a tu cuenta y te enviaremos las instrucciones para restablecerla.",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = OnSurfaceVariantBrand
                        ),
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // ── Campo Correo ───────────────────────────────
                    FireTextField(
                        label = "Correo electrónico",
                        value = uiState.email,
                        onValueChange = { viewModel.onEvent(ForgotPasswordEvent.OnEmailChanged(it)) },
                        placeholder = "ejemplo@fire-support.ia",
                        leadingIcon = Icons.Outlined.Email,
                        error = uiState.emailError
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // ── Botón Enviar instrucciones ─────────────────
                    FireButton(
                        text = "Enviar instrucciones",
                        icon = Icons.Filled.PlayArrow,
                        loading = uiState.isLoading,
                        onClick = { viewModel.onEvent(ForgotPasswordEvent.OnSendInstructionsClicked) }
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Divider
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(CardInactiveBorder)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // ── Link soporte ────────────────────────────────
                    Row {
                        Text(
                            text = "¿Necesitas más ayuda? ",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = OnSurfaceVariantBrand
                            )
                        )
                    }
                    Text(
                        text = "Contacta a soporte institucional.",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = PrimaryBrand,
                            fontWeight = FontWeight.SemiBold
                        ),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.clickable { /* Acción soporte */ }
                    )
                }
            }
        }
    }
}
