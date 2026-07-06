package com.firesupportia.mobile.ui.features.auth.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Rocket
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.firesupportia.mobile.ui.core.components.FireButton
import com.firesupportia.mobile.ui.theme.OnSurfacePrimary
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand

@Composable
fun RegisterSuccessScreen(
    onGoHome: () -> Unit,
    onCompleteProfile: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFFDF2F2),
                        Color(0xFFF9F9FB)
                    )
                )
            )
            .padding(horizontal = 24.dp)
            .padding(vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        // ── Ícono check con anillos ───────────────────────────
        Box(
            modifier = Modifier.size(100.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .background(PrimaryBrand.copy(alpha = 0.12f), CircleShape)
            )
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .background(PrimaryBrand.copy(alpha = 0.18f), CircleShape)
            )
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(PrimaryBrand, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector        = Icons.Filled.Check,
                    contentDescription = "Éxito",
                    tint               = Color.White,
                    modifier           = Modifier.size(24.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // ── Título ────────────────────────────────────────────
        Text(
            text      = "¡Bienvenido a la Brigada Digital!",
            style     = MaterialTheme.typography.headlineSmall.copy(
                color      = OnSurfacePrimary,
                fontWeight = FontWeight.ExtraBold
            ),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(10.dp))

        // ── Subtítulo ─────────────────────────────────────────
        Text(
            text      = "Tu cuenta ha sido creada con éxito. Ahora eres parte de la red de apoyo más grande para los bomberos del Perú.",
            style     = MaterialTheme.typography.bodySmall.copy(
                color = OnSurfaceVariantBrand
            ),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(24.dp))

        // ── Card "Próximo impacto" ────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .border(
                    width = 1.dp,
                    color = PrimaryBrand.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(16.dp)
                )
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Ícono cohete
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(Color(0xFFF5E8E8), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector        = Icons.Filled.Rocket,
                    contentDescription = null,
                    tint               = PrimaryBrand,
                    modifier           = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text  = "Próximo impacto",
                style = MaterialTheme.typography.titleMedium.copy(
                    color      = OnSurfacePrimary,
                    fontWeight = FontWeight.Bold
                )
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text      = "Como primer paso, puedes completar tu perfil o explorar las emergencias más críticas en tu zona.",
                style     = MaterialTheme.typography.bodySmall.copy(
                    color = OnSurfaceVariantBrand
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Card "Emergencias Activas"
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(12.dp))
                    .clickable { onGoHome() }
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector        = Icons.Filled.LocalFireDepartment,
                    contentDescription = null,
                    tint               = PrimaryBrand,
                    modifier           = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text  = "Emergencias Activas",
                        style = MaterialTheme.typography.labelMedium.copy(
                            color      = OnSurfacePrimary,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Box(
                        modifier = Modifier
                            .background(
                                PrimaryBrand.copy(alpha = 0.12f),
                                RoundedCornerShape(8.dp)
                            )
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text  = "12 en vivo",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = PrimaryBrand
                            )
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // ── Botón Ir al Dashboard ─────────────────────────────
        FireButton(
            text    = "Ir al Dashboard",
            icon    = Icons.Filled.ArrowForward,
            onClick = onGoHome
        )

        Spacer(modifier = Modifier.height(12.dp))

        // ── Botón Completar perfil (outline) ──────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .border(1.dp, PrimaryBrand.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                .clickable { onCompleteProfile() },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text  = "Completar perfil",
                style = MaterialTheme.typography.titleMedium.copy(
                    color      = PrimaryBrand,
                    fontWeight = FontWeight.SemiBold
                )
            )
        }
    }
}
