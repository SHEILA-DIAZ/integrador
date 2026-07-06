package com.firesupportia.mobile.ui.core.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Psychology
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.firesupportia.mobile.ui.theme.OnSurfaceVariantBrand
import com.firesupportia.mobile.ui.theme.PrimaryBrand

enum class BottomTab {
    HOME, EXPLORE, ASSISTANT, IMPACT, PROFILE
}

@Composable
fun FireBottomNavBar(
    selectedTab: BottomTab,
    onTabSelected: (BottomTab) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(Color.White)
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceAround,
        verticalAlignment = Alignment.CenterVertically
    ) {
        BottomNavItem(
            icon = Icons.Outlined.Home,
            label = "Inicio",
            selected = selectedTab == BottomTab.HOME,
            onClick = { onTabSelected(BottomTab.HOME) }
        )
        BottomNavItem(
            icon = Icons.Outlined.Explore,
            label = "Explorar",
            selected = selectedTab == BottomTab.EXPLORE,
            onClick = { onTabSelected(BottomTab.EXPLORE) }
        )
        BottomNavItem(
            icon = Icons.Outlined.Psychology,
            label = "IA",
            selected = selectedTab == BottomTab.ASSISTANT,
            onClick = { onTabSelected(BottomTab.ASSISTANT) }
        )
        BottomNavItem(
            icon = Icons.Outlined.BarChart,
            label = "Impacto",
            selected = selectedTab == BottomTab.IMPACT,
            onClick = { onTabSelected(BottomTab.IMPACT) }
        )
        BottomNavItem(
            icon = Icons.Outlined.Person,
            label = "Perfil",
            selected = selectedTab == BottomTab.PROFILE,
            onClick = { onTabSelected(BottomTab.PROFILE) }
        )
    }
}

@Composable
private fun BottomNavItem(
    icon: ImageVector,
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(2.dp),
        modifier = Modifier.clickable { onClick() }
    ) {
        if (selected) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(PrimaryBrand, RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = label,
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
            }
        } else {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = OnSurfaceVariantBrand,
                modifier = Modifier.size(22.dp)
            )
        }
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                color = if (selected) PrimaryBrand else OnSurfaceVariantBrand,
                fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal
            )
        )
    }
}
