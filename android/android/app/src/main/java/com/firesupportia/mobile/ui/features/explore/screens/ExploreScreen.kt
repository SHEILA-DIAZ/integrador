package com.firesupportia.mobile.ui.features.explore.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import com.firesupportia.mobile.ui.core.components.FireCampaignCard
import com.firesupportia.mobile.ui.core.components.FireSectionHeader
import com.firesupportia.mobile.ui.theme.CardInactiveBorder
import com.firesupportia.mobile.ui.theme.OnSurfacePrimary
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand
import com.firesupportia.mobile.ui.theme.NeutralBackground

private val SectionDividerColor = Color(0xFFE5E7EB)

@Composable
fun ExploreScreen(
    onNavigateToHome: () -> Unit,
    onNavigateToAssistant: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("Todas") }
    val filters = listOf("Todas", "Incendios", "Emergencias Médicas")

    Scaffold(
        bottomBar = {
            FireBottomNavBar(
                selectedTab = BottomTab.EXPLORE,
                onTabSelected = { tab ->
                    when (tab) {
                        BottomTab.HOME -> onNavigateToHome()
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
            // ── Top Header ──
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
                            Icon(Icons.Filled.Notifications, null, tint = OnSurfacePrimary, modifier = Modifier.size(22.dp))
                        }
                    }

                    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                        Text(
                            text = "Explorar",
                            style = MaterialTheme.typography.headlineSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = OnSurfacePrimary
                            )
                        )
                        Text(
                            text = "Descubre campañas que necesitan tu apoyo.",
                            style = MaterialTheme.typography.bodyMedium.copy(color = OnSurfaceVariantBrand)
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Barra de búsqueda
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Compañía, distrito o equipo...") },
                        leadingIcon = { Icon(Icons.Filled.Search, null, tint = OnSurfaceVariantBrand) },
                        trailingIcon = { Icon(Icons.Filled.FilterList, null, tint = PrimaryBrand) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryBrand,
                            unfocusedBorderColor = Color(0xFFE5E7EB),
                            unfocusedContainerColor = Color(0xFFF9FAFB),
                            focusedContainerColor = Color.White
                        ),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Filtros
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        filters.forEach { filter ->
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
                                    borderColor = Color(0xFFE5E7EB),
                                    selectedBorderColor = PrimaryBrand
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Campañas Destacadas ──
            Column(modifier = Modifier.fillMaxWidth()) {
                FireSectionHeader(title = "Campañas Destacadas", actionText = "Ver todo")
                Spacer(modifier = Modifier.height(16.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(3) { index ->
                        FireCampaignCard(
                            title = listOf("Trajes de Protección Térmica", "Equipos de Rescate Hidráulico", "Mantenimiento Camión B-14")[index],
                            company = listOf("Cía. Roma 2", "Cía. Salvadora 27", "Cía. B-14")[index],
                            amount = listOf("S/ 4,200", "S/ 2,800", "S/ 6,100")[index],
                            progress = listOf(0.85f, 0.62f, 0.40f)[index],
                            isUrgent = index == 0
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = SectionDividerColor, thickness = 1.dp)
            Spacer(modifier = Modifier.height(24.dp))

            // ── Retos Solidarios ──
            Column(modifier = Modifier.fillMaxWidth()) {
                FireSectionHeader(title = "Retos Solidarios")
                Spacer(modifier = Modifier.height(16.dp))
                Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                    ChallengeCard()
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = SectionDividerColor, thickness = 1.dp)
            Spacer(modifier = Modifier.height(24.dp))

            // ── Compañías de Bomberos ──
            Column(modifier = Modifier.fillMaxWidth()) {
                FireSectionHeader(title = "Compañías Activas", actionText = "Ver todas")
                Spacer(modifier = Modifier.height(16.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    val companies = listOf(
                        Triple(Icons.Outlined.LocalFireDepartment, "Roma 2", "Lima"),
                        Triple(Icons.Outlined.MedicalServices, "Salvadora 27", "Chiclayo"),
                        Triple(Icons.Outlined.DirectionsCar, "B-14", "Cusco")
                    )
                    items(companies.size) { index ->
                        val (icon, name, city) = companies[index]
                        CompanyItem(icon = icon, name = name, city = city)
                    }
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
private fun ChallengeCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(0.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(color = PrimaryBrand, shape = RoundedCornerShape(6.dp)) {
                    Text(
                        "MISIÓN ACTIVA",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall.copy(color = Color.White, fontWeight = FontWeight.Bold)
                    )
                }
                Text("1,240 apoyando", style = MaterialTheme.typography.labelSmall.copy(color = OnSurfaceVariantBrand))
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text("Operación Cascos de Acero", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
            Text("Misión colectiva para equipar a 50 bomberos.", style = MaterialTheme.typography.bodySmall.copy(color = OnSurfaceVariantBrand))
            Spacer(modifier = Modifier.height(16.dp))
            LinearProgressIndicator(
                progress = { 0.75f },
                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                color = PrimaryBrand,
                trackColor = Color(0xFFF3F4F6)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = {},
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBrand),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Unirme al reto", color = Color.White)
            }
        }
    }
}

@Composable
private fun CompanyItem(icon: ImageVector, name: String, city: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(80.dp)
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .background(Color.White, CircleShape)
                .clip(CircleShape)
                .clickable { },
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, null, tint = PrimaryBrand, modifier = Modifier.size(28.dp))
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(name, style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold, textAlign = TextAlign.Center))
        Text(city, style = MaterialTheme.typography.labelSmall.copy(color = OnSurfaceVariantBrand))
    }
}
