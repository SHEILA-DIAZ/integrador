package com.firesupportia.mobile.ui.features.onboarding.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.firesupportia.mobile.ui.core.components.FireButton
import com.firesupportia.mobile.ui.features.onboarding.state.OnboardingEvent
import com.firesupportia.mobile.ui.features.onboarding.viewmodel.OnboardingViewModel
import com.firesupportia.mobile.ui.theme.CardInactiveBorder
import com.firesupportia.mobile.ui.theme.OnSurfacePrimary
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand
import kotlinx.coroutines.launch

@Composable
fun OnboardingScreen(
    viewModel: OnboardingViewModel,
    onCompleted: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()

    LaunchedEffect(uiState.isCompleted) {
        if (uiState.isCompleted) onCompleted()
    }

    val pages = uiState.pages
    if (pages.isEmpty()) return

    val pagerState = rememberPagerState(pageCount = { pages.size })

    // Sincronizar el estado del ViewModel con el Pager (si se pulsan botones)
    LaunchedEffect(uiState.currentPage) {
        if (pagerState.currentPage != uiState.currentPage) {
            pagerState.animateScrollToPage(uiState.currentPage)
        }
    }

    // Sincronizar el Pager con el ViewModel (si se desliza con el dedo)
    LaunchedEffect(pagerState.currentPage) {
        if (uiState.currentPage != pagerState.currentPage) {
            // Actualizamos el ViewModel para que sepa en qué página estamos (opcional, pero buena práctica)
            // Por ahora, como el Pager maneja su propio estado, el ViewModel solo necesita saber el 'isCompleted'
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFFFDF2F2), Color(0xFFF9F9FB))
                )
            )
    ) {
        // ── Botón Saltar ─────────────
        if (pagerState.currentPage < pages.size - 1) {
            Text(
                text = "Saltar",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = PrimaryBrand,
                    fontWeight = FontWeight.SemiBold
                ),
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(24.dp)
                    .clickable { viewModel.onEvent(OnboardingEvent.Skip) }
            )
        }

        // ── Pager Central ─────────────────────────────────
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize()
        ) { pageIndex ->
            val page = pages[pageIndex]
            
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Animación de imagen
                val pageOffset = (pagerState.currentPage - pageIndex) + pagerState.currentPageOffsetFraction
                val imageScale = 1f - (kotlin.math.abs(pageOffset) * 0.2f)
                val imageAlpha = 1f - (kotlin.math.abs(pageOffset) * 0.5f)

                Image(
                    painter = painterResource(id = page.imageRes),
                    contentDescription = page.title,
                    contentScale = ContentScale.Fit,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(260.dp)
                        .graphicsLayer {
                            scaleX = imageScale
                            scaleY = imageScale
                            alpha = imageAlpha
                        }
                )

                Spacer(modifier = Modifier.height(32.dp))

                Text(
                    text = page.title,
                    style = MaterialTheme.typography.headlineSmall.copy(
                        color = OnSurfacePrimary,
                        fontWeight = FontWeight.ExtraBold
                    ),
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = page.subtitle,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = OnSurfaceVariantBrand
                    ),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 8.dp)
                )
            }
        }

        // ── Botón e Indicadores inferiores ────────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Indicadores de puntos
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                pages.forEachIndexed { index, _ ->
                    val isSelected = pagerState.currentPage == index
                    Box(
                        modifier = Modifier
                            .width(if (isSelected) 24.dp else 8.dp)
                            .height(8.dp)
                            .background(
                                color = if (isSelected) PrimaryBrand else CardInactiveBorder,
                                shape = RoundedCornerShape(4.dp)
                            )
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            FireButton(
                text = if (pagerState.currentPage == pages.size - 1) "Empezar →" else "Siguiente →",
                onClick = {
                    if (pagerState.currentPage < pages.size - 1) {
                        scope.launch { pagerState.animateScrollToPage(pagerState.currentPage + 1) }
                    } else {
                        viewModel.onEvent(OnboardingEvent.Skip)
                    }
                }
            )
        }
    }
}
