package com.firesupportia.mobile.ui.features.home.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.firesupportia.mobile.R
import com.firesupportia.mobile.ui.core.components.BottomTab
import com.firesupportia.mobile.ui.core.components.FireBottomNavBar
import com.firesupportia.mobile.ui.core.components.FireCampaignCard
import com.firesupportia.mobile.ui.core.components.FireSectionHeader
import com.firesupportia.mobile.ui.features.home.state.ActivityType
import com.firesupportia.mobile.ui.features.home.viewmodel.HomeViewModel
import com.firesupportia.mobile.ui.theme.OnSurfacePrimary
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand
import com.firesupportia.mobile.ui.theme.NeutralBackground

private val GoldColor = Color(0xFFD4A017)
private val SectionDividerColor = Color(0xFFE5E7EB)

@Composable
fun HomeScreen(
    onNavigateToExplore: () -> Unit,
    onNavigateToAssistant: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        bottomBar = {
            FireBottomNavBar(
                selectedTab = BottomTab.HOME,
                onTabSelected = { tab ->
                    when (tab) {
                        BottomTab.EXPLORE -> onNavigateToExplore()
                        BottomTab.ASSISTANT -> onNavigateToAssistant()
                        else -> Unit
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(NeutralBackground)
                .verticalScroll(rememberScrollState())
        ) {
            // ── Top Header Section ──
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(top = 16.dp, bottom = 24.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AsyncImage(
                                model = R.drawable.logo_firesupport,
                                contentDescription = "Logo",
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "FireSupport IA",
                                style = MaterialTheme.typography.titleLarge.copy(
                                    color = PrimaryBrand,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(Color(0xFFF3F4F6), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Notifications,
                                contentDescription = "Notificaciones",
                                tint = OnSurfacePrimary,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                    }

                    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                        Text(
                            text = "Hola, ${uiState.userName}",
                            style = MaterialTheme.typography.headlineSmall.copy(
                                color = OnSurfacePrimary,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            text = "Tu compromiso protege a nuestra comunidad.",
                            style = MaterialTheme.typography.bodyMedium.copy(color = OnSurfaceVariantBrand)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ── Card de impacto (rojo) ──
            Box(
                modifier = Modifier
                    .padding(horizontal = 16.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(Color(0xFFD62828), Color(0xFFAF101A))
                        )
                    )
                    .padding(24.dp)
            ) {
                Column {
                    Text(
                        text = "TOTAL DONADO",
                        style = MaterialTheme.typography.labelMedium.copy(
                            color = Color.White.copy(alpha = 0.8f),
                            letterSpacing = 1.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = uiState.totalDonated,
                        style = MaterialTheme.typography.displaySmall.copy(
                            color = Color.White,
                            fontWeight = FontWeight.ExtraBold
                        )
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        ImpactInfoItem(
                            icon = Icons.Filled.Favorite,
                            label = "Vidas Impactadas",
                            value = uiState.impactedLives.toString(),
                            valueColor = Color.White
                        )
                        ImpactInfoItem(
                            icon = Icons.Filled.Star,
                            label = "Rango Actual",
                            value = "Donante ${uiState.currentRank}",
                            valueColor = Color(0xFFFFD700)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Accesos rápidos ──
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                QuickAccessItem(Icons.Outlined.History, "Historial")
                QuickAccessItem(Icons.Outlined.Person, "Perfil")
                QuickAccessItem(Icons.Outlined.FavoriteBorder, "Favoritos")
                QuickAccessItem(Icons.Outlined.BarChart, "Impacto")
            }

            Spacer(modifier = Modifier.height(24.dp))
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = SectionDividerColor, thickness = 1.dp)
            Spacer(modifier = Modifier.height(24.dp))

            // ── Sección: Prioridades por IA ──
            Column(modifier = Modifier.fillMaxWidth()) {
                FireSectionHeader(
                    title = "Prioridades por IA",
                    actionText = "Ver todas"
                )
                Spacer(modifier = Modifier.height(16.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(uiState.campaigns.size) { index ->
                        val campaign = uiState.campaigns[index]
                        FireCampaignCard(
                            title = campaign.title,
                            progress = campaign.progress,
                            amount = campaign.amountRemaining,
                            isUrgent = campaign.isUrgent
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = SectionDividerColor, thickness = 1.dp)
            Spacer(modifier = Modifier.height(24.dp))

            // ── Sección: Cerca de ti ──
            Column(modifier = Modifier.fillMaxWidth()) {
                FireSectionHeader(title = "Cerca de ti")
                Spacer(modifier = Modifier.height(16.dp))
                LocationCard()
            }

            Spacer(modifier = Modifier.height(32.dp))
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = SectionDividerColor, thickness = 1.dp)
            Spacer(modifier = Modifier.height(24.dp))

            // ── Sección: Actividad Reciente ──
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 32.dp)
            ) {
                FireSectionHeader(title = "Actividad Reciente")
                Spacer(modifier = Modifier.height(16.dp))
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    uiState.recentActivity.forEach { activity ->
                        ActivityItem(
                            icon = if (activity.type == ActivityType.DONATION)
                                Icons.Outlined.VolunteerActivism else Icons.Filled.Star,
                            title = activity.title,
                            subtitle = activity.subtitle,
                            tint = if (activity.type == ActivityType.DONATION)
                                PrimaryBrand else GoldColor
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun ImpactInfoItem(
    icon: ImageVector,
    label: String,
    value: String,
    valueColor: Color
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .background(Color.White.copy(alpha = 0.15f), RoundedCornerShape(10.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = valueColor,
                modifier = Modifier.size(18.dp)
            )
        }
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall.copy(color = Color.White.copy(alpha = 0.7f))
            )
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium.copy(
                    color = valueColor,
                    fontWeight = FontWeight.Bold
                )
            )
        }
    }
}

@Composable
private fun LocationCard() {
    Card(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .fillMaxWidth()
            .height(180.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFE5E7EB)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Filled.LocationOn, null, tint = PrimaryBrand, modifier = Modifier.size(40.dp))
            }

            Surface(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth(),
                color = Color.White.copy(alpha = 0.95f)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Estación Sur B-14",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "A 1.2 km de tu ubicación",
                            style = MaterialTheme.typography.bodySmall.copy(color = OnSurfaceVariantBrand)
                        )
                    }
                    Button(
                        onClick = {},
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBrand),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text("Ver mapa", style = MaterialTheme.typography.labelLarge.copy(color = Color.White))
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickAccessItem(
    icon: ImageVector,
    label: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .background(Color.White, RoundedCornerShape(16.dp))
                .clickable {},
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = PrimaryBrand,
                modifier = Modifier.size(24.dp)
            )
        }
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium.copy(
                color = OnSurfacePrimary,
                fontWeight = FontWeight.Medium
            )
        )
    }
}

@Composable
private fun ActivityItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    tint: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(tint.copy(alpha = 0.1f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = tint, modifier = Modifier.size(20.dp))
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(title, style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                Text(subtitle, style = MaterialTheme.typography.bodySmall.copy(color = OnSurfaceVariantBrand))
            }
            Icon(Icons.Filled.ChevronRight, null, tint = Color(0xFFD1D5DB), modifier = Modifier.size(20.dp))
        }
    }
}
