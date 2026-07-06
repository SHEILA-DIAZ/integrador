package com.firesupportia.mobile.ui.features.splash.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.VerifiedUser
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.firesupportia.mobile.R
import com.firesupportia.mobile.ui.features.splash.viewmodel.SplashUiState
import com.firesupportia.mobile.ui.features.splash.viewmodel.SplashViewModel
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand
import com.firesupportia.mobile.ui.theme.SurfaceBright
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToHome: () -> Unit,
    onNavigateToOnboarding: () -> Unit,
    viewModel: SplashViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val infiniteTransition = rememberInfiniteTransition(label = "splash")

    // Animación 1 — Logo soft-pulse
    val logoScale by infiniteTransition.animateFloat(
        initialValue  = 1f,
        targetValue   = 1.05f,
        animationSpec = infiniteRepeatable(
            animation  = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ), label = "logoScale"
    )
    val logoAlpha by infiniteTransition.animateFloat(
        initialValue  = 1f,
        targetValue   = 0.9f,
        animationSpec = infiniteRepeatable(
            animation  = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ), label = "logoAlpha"
    )

    // Animación 2 — Loader spin
    val loaderRotation by infiniteTransition.animateFloat(
        initialValue  = 0f,
        targetValue   = 360f,
        animationSpec = infiniteRepeatable(
            animation  = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ), label = "loaderRotation"
    )

    // Navegación automática
    LaunchedEffect(state) {
        if (state !is SplashUiState.Idle) {
            val navigationDelay = if (state is SplashUiState.GoToHome) 1500L else 3000L
            delay(navigationDelay)
            when (state) {
                SplashUiState.GoToHome -> onNavigateToHome()
                SplashUiState.GoToLogin -> onNavigateToLogin()
                SplashUiState.GoToOnboarding -> onNavigateToOnboarding()
                else -> Unit
            }
        }
    }

    // Animación 3 — Footer fade-in-up
    var footerVisible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        delay(500L)
        footerVisible = true
    }
    val footerAlpha by animateFloatAsState(
        targetValue   = if (footerVisible) 0.8f else 0f,
        animationSpec = tween(800, easing = FastOutSlowInEasing),
        label         = "footerAlpha"
    )
    val footerOffsetY by animateFloatAsState(
        targetValue   = if (footerVisible) 0f else 10f,
        animationSpec = tween(800, easing = FastOutSlowInEasing),
        label         = "footerOffset"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBright),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {

        Spacer(modifier = Modifier.height(0.dp))

        // Zona central — Logo + Título
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp)
                .padding(top = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(128.dp)
                    .graphicsLayer(
                        scaleX = logoScale,
                        scaleY = logoScale,
                        alpha  = logoAlpha
                    )
            ) {
                AsyncImage(
                    model              = R.drawable.logo_firesupport,
                    contentDescription = "FireSupport IA Logo",
                    modifier           = Modifier.fillMaxSize()
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text      = "FireSupport IA",
                style     = MaterialTheme.typography.headlineMedium.copy(
                    color = PrimaryBrand
                ),
                textAlign = TextAlign.Center
            )
        }

        // Footer — Loader + Textos
        Column(
            modifier = Modifier
                .padding(start = 16.dp, end = 16.dp, bottom = 48.dp)
                .alpha(footerAlpha)
                .graphicsLayer(translationY = footerOffsetY),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier        = Modifier.size(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.size(24.dp)) {
                    rotate(degrees = loaderRotation) {
                        drawArc(
                            color     = PrimaryBrand,
                            startAngle = -90f,
                            sweepAngle = 90f,
                            useCenter  = false,
                            style      = Stroke(
                                width = 2.dp.toPx(),
                                cap   = StrokeCap.Round
                            )
                        )
                    }
                }
            }

            Text(
                text      = "Impulsado por IA para los Bomberos del Perú",
                style     = MaterialTheme.typography.labelLarge.copy(
                    color = OnSurfaceVariantBrand
                ),
                textAlign = TextAlign.Center
            )

            Row(
                verticalAlignment     = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                modifier              = Modifier.alpha(0.4f)
            ) {
                Icon(
                    imageVector        = Icons.Outlined.VerifiedUser,
                    contentDescription = null,
                    modifier           = Modifier.size(16.dp),
                    tint               = OnSurfaceVariantBrand
                )
                Text(
                    text  = "Sistema de Respuesta Segura",
                    style = MaterialTheme.typography.labelMedium.copy(
                        color = OnSurfaceVariantBrand
                    )
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun SplashScreenPreview() {
    // Preview básico sin lógica de navegación real
    Text("Splash Screen Preview")
}
