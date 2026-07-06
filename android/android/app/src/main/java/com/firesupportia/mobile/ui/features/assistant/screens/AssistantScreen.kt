package com.firesupportia.mobile.ui.features.assistant.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.firesupportia.mobile.R
import com.firesupportia.mobile.ui.core.components.BottomTab
import com.firesupportia.mobile.ui.core.components.FireBottomNavBar
import com.firesupportia.mobile.ui.core.components.FireButton
import com.firesupportia.mobile.ui.core.components.FireSectionHeader
import com.firesupportia.mobile.ui.theme.CardInactiveBorder
import com.firesupportia.mobile.ui.theme.NeutralBackground
import com.firesupportia.mobile.ui.theme.OnSurfacePrimary
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand

private val BadgeUrgent = Color(0xFFD62828)
private val MatchPurple = Color(0xFF6366F1)
private val SectionDividerColor = Color(0xFFE5E7EB)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AssistantScreen(
    onNavigateToHome: () -> Unit,
    onNavigateToExplore: () -> Unit,
    onNavigateToImpact: () -> Unit,
    onNavigateToProfile: () -> Unit
) {
    var selectedFilter by remember { mutableStateOf("Todo") }
    val filters = listOf("Todo", "Incendios", "Emergencias Médicas")

    Scaffold(
        bottomBar = {
            FireBottomNavBar(
                selectedTab = BottomTab.ASSISTANT,
                onTabSelected = { tab ->
                    when (tab) {
                        BottomTab.HOME -> onNavigateToHome()
                        BottomTab.EXPLORE -> onNavigateToExplore()
                        BottomTab.IMPACT -> onNavigateToImpact()
                        BottomTab.PROFILE -> onNavigateToProfile()
                        else -> Unit
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* IA Action */ },
                containerColor = PrimaryBrand,
                contentColor = Color.White,
                shape = CircleShape
            ) {
                Icon(Icons.Outlined.Psychology, contentDescription = "IA Assistant")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(NeutralBackground)
                .verticalScroll(rememberScrollState())
        ) {
            // --- TOP BAR ---
            Box(modifier = Modifier.fillMaxWidth().background(Color.White).padding(top = 16.dp, bottom = 24.dp)) {
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
                            modifier = Modifier.size(40.dp).background(Color(0xFFF3F4F6), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Outlined.Notifications, null, tint = OnSurfacePrimary)
                        }
                    }

                    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                        Text(
                            text = "Asistente Inteligente",
                            style = MaterialTheme.typography.headlineSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = OnSurfacePrimary
                            )
                        )
                        Text(
                            text = "Recomendaciones creadas especialmente para ti",
                            style = MaterialTheme.typography.bodyMedium.copy(color = OnSurfaceVariantBrand)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // --- KPI CARDS ---
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                KpiCard(label = "ANALIZADAS", value = "287", unit = "campañas", isPrimary = false, modifier = Modifier.weight(1f))
                KpiCard(label = "COMPATIBLES", value = "12", unit = "oportunidades", isPrimary = true, modifier = Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(16.dp))

            // --- UPDATE INFO ---
            Row(
                modifier = Modifier.padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Outlined.AccessTime, null, modifier = Modifier.size(14.dp), tint = OnSurfaceVariantBrand)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Actualizado hace 5 min", style = MaterialTheme.typography.labelSmall.copy(color = OnSurfaceVariantBrand))
                Spacer(modifier = Modifier.width(16.dp))
                Icon(Icons.Outlined.TrendingUp, null, modifier = Modifier.size(14.dp), tint = MatchPurple)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Nuevas tendencias detectadas", style = MaterialTheme.typography.labelSmall.copy(color = MatchPurple, fontWeight = FontWeight.Bold))
            }

            Spacer(modifier = Modifier.height(24.dp))
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = SectionDividerColor, thickness = 1.dp)
            Spacer(modifier = Modifier.height(24.dp))

            // --- FILTERS ---
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filters.size) { index ->
                    val filter = filters[index]
                    val isSelected = selectedFilter == filter
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedFilter = filter },
                        label = { Text(filter) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryBrand,
                            selectedLabelColor = Color.White,
                            containerColor = Color.White,
                            labelColor = OnSurfaceVariantBrand
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = SectionDividerColor,
                            selectedBorderColor = PrimaryBrand
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // --- RECOMENDADO PARA TI ---
            FireSectionHeader("Recomendado para ti", actionText = "Ver todo")
            Spacer(modifier = Modifier.height(16.dp))
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(2) { index ->
                    RecommendationCard(
                        title = if (index == 0) "Equipamiento de Respiración" else "Insumos Médicos Básicos",
                        company = if (index == 0) "Compañía Roma No. 2 - Distrito Central" else "Estación Central - Sector Norte",
                        match = if (index == 0) 96 else 92,
                        progress = if (index == 0) 0.78f else 0.45f,
                        isUrgent = index == 0
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = SectionDividerColor, thickness = 1.dp)
            Spacer(modifier = Modifier.height(24.dp))

            // --- SIMULADOR DE IMPACTO ---
            FireSectionHeader("¿Qué pasaría si donaras aquí?")
            Spacer(modifier = Modifier.height(16.dp))
            ImpactSimulatorCard()

            Spacer(modifier = Modifier.height(32.dp))
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = SectionDividerColor, thickness = 1.dp)
            Spacer(modifier = Modifier.height(24.dp))

            // --- CERCA DE TI ---
            FireSectionHeader("Cerca de ti")
            Spacer(modifier = Modifier.height(16.dp))
            NearYouCard()

            Spacer(modifier = Modifier.height(32.dp))
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = SectionDividerColor, thickness = 1.dp)
            Spacer(modifier = Modifier.height(24.dp))

            // --- TENDENCIAS IA ---
            AiTrendSummaryCard()

            Spacer(modifier = Modifier.height(24.dp))

            // --- PREFERENCIAS IA ---
            AiPreferencesCard()

            Spacer(modifier = Modifier.height(32.dp))

            // --- FOOTER INFO ---
            FooterInfo()

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
private fun KpiCard(label: String, value: String, unit: String, isPrimary: Boolean, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isPrimary) PrimaryBrand else Color.White
        ),
        elevation = CardDefaults.cardElevation(0.dp),
        border = if (!isPrimary) BorderStroke(1.dp, SectionDividerColor) else null
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    color = if (isPrimary) Color.White.copy(alpha = 0.8f) else OnSurfaceVariantBrand
                )
            )
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = if (isPrimary) Color.White else PrimaryBrand
                )
            )
            Text(
                text = unit,
                style = MaterialTheme.typography.labelSmall.copy(
                    color = if (isPrimary) Color.White.copy(alpha = 0.9f) else OnSurfaceVariantBrand
                )
            )
        }
    }
}

@Composable
fun RecommendationCard(title: String, company: String, match: Int, progress: Float, isUrgent: Boolean) {
    Card(
        modifier = Modifier.width(280.dp).height(380.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(0.dp),
        border = BorderStroke(1.dp, SectionDividerColor)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
                    .background(Color(0xFFF3F4F6))
            ) {
                Row(
                    modifier = Modifier.padding(12.dp).align(Alignment.TopStart),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = Color.White.copy(alpha = 0.9f),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Row(modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("$match%", style = MaterialTheme.typography.labelSmall.copy(color = MatchPurple, fontWeight = FontWeight.Bold))
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.Outlined.Psychology, null, modifier = Modifier.size(14.dp), tint = MatchPurple)
                        }
                    }
                    if (isUrgent) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            color = BadgeUrgent,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                "Urgente",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelSmall.copy(color = Color.White, fontWeight = FontWeight.Bold)
                            )
                        }
                    }
                }
            }
            Column(modifier = Modifier.padding(16.dp).weight(1f)) {
                Text(title, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), maxLines = 1)
                Text(company, style = MaterialTheme.typography.bodySmall.copy(color = OnSurfaceVariantBrand), maxLines = 1, overflow = TextOverflow.Ellipsis)
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Compatibilidad", style = MaterialTheme.typography.labelSmall.copy(color = OnSurfaceVariantBrand))
                    Text("$match%", style = MaterialTheme.typography.labelSmall.copy(color = MatchPurple, fontWeight = FontWeight.Bold))
                }
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp).height(8.dp).clip(RoundedCornerShape(4.dp)),
                    color = PrimaryBrand,
                    trackColor = Color(0xFFF3F4F6)
                )

                Spacer(modifier = Modifier.height(16.dp))
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { },
                        modifier = Modifier.weight(1f).height(40.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBrand),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Me interesa", color = Color.White)
                    }
                    IconButton(
                        onClick = { },
                        modifier = Modifier.size(40.dp).border(1.dp, SectionDividerColor, RoundedCornerShape(10.dp))
                    ) {
                        Icon(Icons.Default.Close, null, tint = OnSurfaceVariantBrand)
                    }
                }
            }
        }
    }
}

@Composable
fun ImpactSimulatorCard() {
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(0.dp),
        border = BorderStroke(1.dp, SectionDividerColor)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            ImpactMetricRow("Campaña A: Impacto Alto", "+12 vidas salvadas/mes", 0.9f, PrimaryBrand)
            Spacer(modifier = Modifier.height(20.dp))
            ImpactMetricRow("Campaña B: Impacto Medio", "+5 vidas salvadas/mes", 0.6f, Color(0xFF3F51B5))
            Spacer(modifier = Modifier.height(20.dp))
            ImpactMetricRow("Campaña C: Impacto Base", "+2 vidas salvadas/mes", 0.3f, Color(0xFF8B5E3C))
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Surface(
                color = Color(0xFFF9FAFB),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Impacto proyectado por IA basado en históricos de respuesta.",
                    style = MaterialTheme.typography.labelSmall.copy(color = OnSurfaceVariantBrand, textAlign = TextAlign.Center),
                    modifier = Modifier.padding(12.dp)
                )
            }
        }
    }
}

@Composable
fun ImpactMetricRow(label: String, value: String, progress: Float, color: Color) {
    Column {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(label, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium))
            Text(value, style = MaterialTheme.typography.labelSmall.copy(color = color, fontWeight = FontWeight.Bold))
        }
        Spacer(modifier = Modifier.height(8.dp))
        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
            color = color,
            trackColor = Color(0xFFF3F4F6)
        )
    }
}

@Composable
fun NearYouCard() {
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(0.dp),
        border = BorderStroke(1.dp, SectionDividerColor)
    ) {
        Column {
            Box(
                modifier = Modifier.fillMaxWidth().height(220.dp).background(Color(0xFFE5E7EB)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Outlined.Map, null, modifier = Modifier.size(48.dp), tint = Color(0xFF9CA3AF))
                
                Row(
                    modifier = Modifier.align(Alignment.BottomStart).padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    DistanceChip("5km", true)
                    DistanceChip("15km", false)
                }
                
                Surface(
                    modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
                    color = Color.White,
                    shape = RoundedCornerShape(8.dp),
                    shadowElevation = 2.dp
                ) {
                    Row(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Place, null, modifier = Modifier.size(14.dp), tint = PrimaryBrand)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("3 campañas", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                    }
                }
            }
        }
    }
}

@Composable
fun DistanceChip(label: String, selected: Boolean) {
    Surface(
        color = if (selected) PrimaryBrand else Color.White,
        shape = RoundedCornerShape(8.dp),
        border = if (selected) null else BorderStroke(1.dp, SectionDividerColor),
        modifier = Modifier.clickable { }
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelSmall.copy(color = if (selected) Color.White else OnSurfacePrimary, fontWeight = FontWeight.Bold)
        )
    }
}

@Composable
fun AiTrendSummaryCard() {
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(0.dp),
        border = BorderStroke(1.dp, SectionDividerColor)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.TrendingUp, null, tint = PrimaryBrand, modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Text("Tendencias IA", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Las campañas de prevención aumentaron un 28% debido a factores climáticos locales.",
                style = MaterialTheme.typography.bodyMedium.copy(color = OnSurfacePrimary)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Surface(
                color = MatchPurple.copy(alpha = 0.08f),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.AutoGraph, null, modifier = Modifier.size(16.dp), tint = MatchPurple)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Probabilidad Alta de Impacto", style = MaterialTheme.typography.labelSmall.copy(color = MatchPurple, fontWeight = FontWeight.Bold))
                }
            }
        }
    }
}

@Composable
fun AiPreferencesCard() {
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(0.dp),
        border = BorderStroke(1.dp, SectionDividerColor)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text("Preferencias del Asistente", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
            Spacer(modifier = Modifier.height(16.dp))
            PreferenceItem("Priorizar impacto directo", true)
            PreferenceItem("Campañas en mi distrito", true)
            PreferenceItem("Urgencias críticas primero", false)
        }
    }
}

@Composable
fun PreferenceItem(label: String, checked: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
        Checkbox(
            checked = checked,
            onCheckedChange = {},
            colors = CheckboxDefaults.colors(checkedColor = PrimaryBrand)
        )
        Text(label, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
fun FooterInfo() {
    Column(modifier = Modifier.fillMaxWidth().padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Outlined.Verified, null, modifier = Modifier.size(16.dp), tint = Color(0xFF10B981))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Precisión del modelo: 94%", style = MaterialTheme.typography.labelSmall.copy(color = Color(0xFF10B981), fontWeight = FontWeight.Bold))
        }
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = "Tus datos están encriptados y protegidos.",
            style = MaterialTheme.typography.labelSmall.copy(color = OnSurfaceVariantBrand, fontSize = 10.sp),
            textAlign = TextAlign.Center
        )
    }
}
