package com.firesupportia.mobile.ui.features.auth.screens

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.firesupportia.mobile.ui.core.components.FireButton
import com.firesupportia.mobile.ui.core.components.FireTextField
import com.firesupportia.mobile.ui.core.state.UiEvent
import com.firesupportia.mobile.ui.features.auth.state.LoginEvent
import com.firesupportia.mobile.ui.features.auth.viewmodel.LoginViewModel
import com.firesupportia.mobile.ui.theme.CardInactiveBorder
import com.firesupportia.mobile.ui.theme.OnSurfacePrimary
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.GoogleAuthProvider

@Composable
fun LoginScreen(
    onNavigateToRegister: () -> Unit,
    onNavigateToForgotPassword: () -> Unit,
    onLoginSuccess: () -> Unit,
    viewModel: LoginViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val context = LocalContext.current

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            account?.idToken?.let { idToken ->
                val credential = GoogleAuthProvider.getCredential(idToken, null)
                viewModel.onEvent(LoginEvent.OnGoogleLoginSuccess(credential))
            }
        } catch (e: ApiException) {
            // Manejar error si es necesario
        }
    }

    LaunchedEffect(Unit) {
        viewModel.onEvent(LoginEvent.OnClearForm)
        viewModel.uiEvent.collect { event ->
            when (event) {
                is UiEvent.ShowSnackbar -> {
                    snackbarHostState.showSnackbar(event.message)
                }
                is UiEvent.Navigate -> {
                    onLoginSuccess()
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
                .padding(horizontal = 20.dp)
                .padding(vertical = 24.dp),
            verticalArrangement = Arrangement.Center
        ) {

        // ── Título ────────────────────────────────────────────
        Text(
            text      = "Bienvenido de nuevo",
            style     = MaterialTheme.typography.headlineSmall.copy(
                color      = OnSurfacePrimary,
                fontWeight = FontWeight.ExtraBold
            ),
            textAlign = TextAlign.Center,
            modifier  = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text      = "Tu compromiso con salvar vidas continúa aquí",
            style     = MaterialTheme.typography.bodySmall.copy(
                color = OnSurfacePrimary
            ),
            textAlign = TextAlign.Center,
            modifier  = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

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
                .background(Color.White, RoundedCornerShape(16.dp))
                .padding(22.dp)
        ) {

            // Correo electrónico
            FireTextField(
                label = "Correo electrónico",
                value = uiState.email,
                onValueChange = { viewModel.onEvent(LoginEvent.OnEmailChanged(it)) },
                placeholder = "ejemplo@correo.com",
                leadingIcon = Icons.Outlined.Email,
                error = uiState.emailError,
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next
            )

            Spacer(modifier = Modifier.height(18.dp))

            // Contraseña
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier              = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment     = Alignment.CenterVertically
                ) {
                    Text(
                        text  = "Contraseña",
                        style = MaterialTheme.typography.labelMedium.copy(
                            color = if (uiState.passwordError != null) MaterialTheme.colorScheme.error else OnSurfacePrimary
                        )
                    )
                    Text(
                        text     = "¿Olvidaste tu contraseña?",
                        style    = MaterialTheme.typography.labelSmall.copy(
                            color = PrimaryBrand
                        ),
                        modifier = Modifier.clickable { onNavigateToForgotPassword() }
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                
                // Usamos un FireTextField simplificado o ajustado para el layout de contraseña con el link al costado
                // Pero para mantener consistencia con el diseño previo y el componente, 
                // lo manejaremos como un campo de contraseña estándar dentro del FireTextField
                FireTextField(
                    label = "", // Ocultamos el label de arriba porque ya pusimos uno personalizado con el link
                    value = uiState.password,
                    onValueChange = { viewModel.onEvent(LoginEvent.OnPasswordChanged(it)) },
                    placeholder = "••••••••",
                    leadingIcon = Icons.Outlined.Lock,
                    isPassword = true,
                    error = uiState.passwordError,
                    imeAction = ImeAction.Done
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Botón Acceder al sistema ──────────────────────
            FireButton(
                text    = "Acceder al sistema",
                icon    = Icons.Filled.Bolt,
                loading = uiState.isLoading,
                onClick = { viewModel.onEvent(LoginEvent.OnLoginClicked) }
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Divider "O continúa con"
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier          = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(1.dp)
                        .background(CardInactiveBorder)
                )
                Text(
                    text     = "O continúa con",
                    style    = MaterialTheme.typography.labelSmall.copy(
                        color = OnSurfaceVariantBrand
                    ),
                    modifier = Modifier.padding(horizontal = 12.dp)
                )
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(1.dp)
                        .background(CardInactiveBorder)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Botón Continuar con Google
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .background(Color.White, RoundedCornerShape(12.dp))
                    .border(1.dp, CardInactiveBorder, RoundedCornerShape(12.dp))
                    .clickable { 
                        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                            .requestIdToken("615580984099-03kau7h3fcklrpuq4l3287lbac6jvn5q.apps.googleusercontent.com")
                            .requestEmail()
                            .build()
                        val googleSignInClient = GoogleSignIn.getClient(context, gso)
                        launcher.launch(googleSignInClient.signInIntent)
                    },
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("G", fontWeight = FontWeight.Bold, color = PrimaryBrand)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text  = "Continuar con Google",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color      = OnSurfacePrimary,
                            fontWeight = FontWeight.Medium
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // ── Link crear cuenta ─────────────────────────────────
        Row(
            modifier              = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text  = "¿No tienes una cuenta? ",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = OnSurfacePrimary
                )
            )
            Text(
                text     = "Crear cuenta",
                style    = MaterialTheme.typography.bodyMedium.copy(
                    color      = PrimaryBrand,
                    fontWeight = FontWeight.SemiBold
                ),
                modifier = Modifier.clickable { onNavigateToRegister() }
            )
        }
    }
}
}
