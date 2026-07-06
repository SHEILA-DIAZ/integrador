package com.firesupportia.mobile.ui.core.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.firesupportia.mobile.ui.theme.PrimaryBrand

enum class ButtonStyle {
    PRIMARY, SECONDARY, OUTLINED
}

@Composable
fun FireButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
    icon: ImageVector? = null,
    style: ButtonStyle = ButtonStyle.PRIMARY,
    fullWidth: Boolean = true
) {
    val buttonModifier = if (fullWidth) modifier.fillMaxWidth() else modifier
    val finalModifier = buttonModifier.height(54.dp)

    val content = @Composable {
        if (loading) {
            CircularProgressIndicator(
                color = if (style == ButtonStyle.OUTLINED) PrimaryBrand else Color.White,
                strokeWidth = 2.dp,
                modifier = Modifier.size(20.dp)
            )
        } else {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                if (icon != null) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text(
                    text = text,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold
                    )
                )
            }
        }
    }

    when (style) {
        ButtonStyle.PRIMARY -> {
            Button(
                onClick = onClick,
                enabled = enabled && !loading,
                modifier = finalModifier,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = PrimaryBrand,
                    contentColor = Color.White,
                    disabledContainerColor = PrimaryBrand.copy(alpha = 0.5f),
                    disabledContentColor = Color.White.copy(alpha = 0.7f)
                ),
                content = { content() }
            )
        }
        ButtonStyle.SECONDARY -> {
            Button(
                onClick = onClick,
                enabled = enabled && !loading,
                modifier = finalModifier,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFF5F5F7),
                    contentColor = Color.Black,
                    disabledContainerColor = Color(0xFFF5F5F7).copy(alpha = 0.5f),
                    disabledContentColor = Color.Black.copy(alpha = 0.4f)
                ),
                content = { content() }
            )
        }
        ButtonStyle.OUTLINED -> {
            OutlinedButton(
                onClick = onClick,
                enabled = enabled && !loading,
                modifier = finalModifier,
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, if (enabled) PrimaryBrand else PrimaryBrand.copy(alpha = 0.5f)),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = PrimaryBrand,
                    disabledContentColor = PrimaryBrand.copy(alpha = 0.5f)
                ),
                content = { content() }
            )
        }
    }
}
