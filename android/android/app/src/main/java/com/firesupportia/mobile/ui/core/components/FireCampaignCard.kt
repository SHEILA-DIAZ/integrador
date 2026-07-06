package com.firesupportia.mobile.ui.core.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.firesupportia.mobile.ui.theme.OnSurfacePrimary
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand

@Composable
fun FireCampaignCard(
    title: String,
    modifier: Modifier = Modifier,
    company: String? = null,
    amount: String,
    progress: Float,
    isUrgent: Boolean = false,
    onDonateClick: () -> Unit = {}
) {
    Column(
        modifier = modifier
            .width(220.dp) // Ancho fijo para uniformidad
            .height(280.dp) // Alto fijo para alineación perfecta
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .padding(12.dp)
    ) {
        // Altura fija para el contenedor de imagen y badge
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(110.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0xFFF3F4F6))
        ) {
            if (isUrgent) {
                Box(
                    modifier = Modifier
                        .padding(8.dp)
                        .background(Color(0xFFD62828), RoundedCornerShape(4.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                        .align(Alignment.TopStart)
                ) {
                    Text(
                        text = "URGENTE",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 9.sp
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Contenedor de textos con peso para empujar el botón al fondo
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall.copy(
                    color = OnSurfacePrimary,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 18.sp
                ),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            if (company != null) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = company,
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = OnSurfaceVariantBrand,
                        fontSize = 11.sp
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Meta y Progreso
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${(progress * 100).toInt()}%",
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = PrimaryBrand,
                        fontWeight = FontWeight.Bold
                    )
                )
                Text(
                    text = amount,
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = OnSurfaceVariantBrand,
                        fontWeight = FontWeight.Medium
                    )
                )
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(Color(0xFFE5E7EB))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(progress)
                        .fillMaxHeight()
                        .background(PrimaryBrand)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Botón siempre alineado al fondo
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(36.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(PrimaryBrand)
                .clickable { onDonateClick() },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Donar ahora",
                style = MaterialTheme.typography.labelMedium.copy(
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold
                )
            )
        }
    }
}
