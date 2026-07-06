package com.firesupportia.mobile.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.runtime.Composable
import androidx.compose.material3.Text
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.firesupportia.mobile.ui.features.assistant.screens.AssistantScreen
import com.firesupportia.mobile.ui.features.auth.screens.ForgotPasswordScreen
import com.firesupportia.mobile.ui.features.auth.screens.LoginScreen
import com.firesupportia.mobile.ui.features.auth.screens.OtpVerificationScreen
import com.firesupportia.mobile.ui.features.auth.screens.RegisterScreen
import com.firesupportia.mobile.ui.features.auth.screens.RegisterSuccessScreen
import com.firesupportia.mobile.ui.features.auth.state.LoginEvent
import com.firesupportia.mobile.ui.features.auth.viewmodel.LoginViewModel
import com.firesupportia.mobile.ui.features.explore.screens.ExploreScreen
import com.firesupportia.mobile.ui.features.home.screens.HomeScreen
import com.firesupportia.mobile.ui.features.onboarding.screens.OnboardingScreen
import com.firesupportia.mobile.ui.features.splash.screens.SplashScreen
import com.firesupportia.mobile.ui.navigation.NavRoutes

@Composable
fun AppNavigation(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = NavRoutes.SPLASH,
        enterTransition = {
            fadeIn(animationSpec = tween(500)) + slideIntoContainer(
                towards = AnimatedContentTransitionScope.SlideDirection.Left,
                animationSpec = tween(500)
            )
        },
        exitTransition = {
            fadeOut(animationSpec = tween(500)) + slideOutOfContainer(
                towards = AnimatedContentTransitionScope.SlideDirection.Left,
                animationSpec = tween(500)
            )
        },
        popEnterTransition = {
            fadeIn(animationSpec = tween(500)) + slideIntoContainer(
                towards = AnimatedContentTransitionScope.SlideDirection.Right,
                animationSpec = tween(500)
            )
        },
        popExitTransition = {
            fadeOut(animationSpec = tween(500)) + slideOutOfContainer(
                towards = AnimatedContentTransitionScope.SlideDirection.Right,
                animationSpec = tween(500)
            )
        }
    ) {
        composable(NavRoutes.SPLASH) {
            SplashScreen(
                onNavigateToLogin = {
                    navController.navigate(NavRoutes.LOGIN) {
                        popUpTo(NavRoutes.SPLASH) { inclusive = true }
                    }
                },
                onNavigateToHome = {
                    navController.navigate(NavRoutes.HOME) {
                        popUpTo(NavRoutes.SPLASH) { inclusive = true }
                    }
                },
                onNavigateToOnboarding = {
                    navController.navigate(NavRoutes.ONBOARDING) {
                        popUpTo(NavRoutes.SPLASH) { inclusive = true }
                    }
                }
            )
        }

        composable(NavRoutes.ONBOARDING) {
            OnboardingScreen(
                viewModel = hiltViewModel(),
                onCompleted = {
                    navController.navigate(NavRoutes.HOME) {
                        popUpTo(NavRoutes.ONBOARDING) { inclusive = true }
                    }
                }
            )
        }

        composable(NavRoutes.LOGIN) {
            val loginViewModel: LoginViewModel = hiltViewModel()
            LoginScreen(
                onNavigateToRegister = {
                    loginViewModel.onEvent(LoginEvent.OnClearForm)
                    navController.navigate(NavRoutes.REGISTER)
                },
                onNavigateToForgotPassword = {
                    navController.navigate(NavRoutes.FORGOT_PASSWORD)
                },
                onLoginSuccess = {
                    navController.navigate(NavRoutes.ONBOARDING) {
                        popUpTo(NavRoutes.LOGIN) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                viewModel = loginViewModel
            )
        }

        composable(NavRoutes.REGISTER) {
            RegisterScreen(
                onNavigateToLogin = {
                    navController.popBackStack()
                },
                onRegisterSuccess = {
                    navController.navigate(NavRoutes.OTP_VERIFICATION) {
                        launchSingleTop = true
                    }
                }
            )
        }

        composable(NavRoutes.OTP_VERIFICATION) {
            OtpVerificationScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onCodeVerified = {
                    navController.navigate(NavRoutes.REGISTER_SUCCESS) {
                        popUpTo(NavRoutes.REGISTER) { inclusive = true }
                    }
                }
            )
        }

        composable(NavRoutes.REGISTER_SUCCESS) {
            RegisterSuccessScreen(
                onGoHome = {
                    navController.navigate(NavRoutes.ONBOARDING) {
                        popUpTo(NavRoutes.LOGIN) { inclusive = true }
                    }
                },
                onCompleteProfile = {
                    navController.navigate(NavRoutes.ONBOARDING) {
                        popUpTo(NavRoutes.LOGIN) { inclusive = true }
                    }
                }
            )
        }

        composable(NavRoutes.FORGOT_PASSWORD) {
            ForgotPasswordScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onNavigateToLogin = {
                    navController.popBackStack()
                }
            )
        }

        composable(NavRoutes.HOME) {
            HomeScreen(
                onNavigateToExplore = {
                    navController.navigate(NavRoutes.EXPLORE) {
                        popUpTo(NavRoutes.HOME) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                onNavigateToAssistant = {
                    navController.navigate(NavRoutes.ASSISTANT) {
                        popUpTo(NavRoutes.HOME) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }

        composable(NavRoutes.EXPLORE) {
            ExploreScreen(
                onNavigateToHome = {
                    navController.navigate(NavRoutes.HOME) {
                        popUpTo(NavRoutes.HOME) { inclusive = true }
                    }
                },
                onNavigateToAssistant = {
                    navController.navigate(NavRoutes.ASSISTANT) {
                        popUpTo(NavRoutes.HOME) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }

        composable(NavRoutes.ASSISTANT) {
            AssistantScreen(
                onNavigateToHome = {
                    navController.navigate(NavRoutes.HOME) {
                        popUpTo(NavRoutes.HOME) { inclusive = true }
                    }
                },
                onNavigateToExplore = {
                    navController.navigate(NavRoutes.EXPLORE) {
                        popUpTo(NavRoutes.HOME) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                onNavigateToImpact = {
                    navController.navigate(NavRoutes.IMPACT) {
                        popUpTo(NavRoutes.HOME) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                onNavigateToProfile = {
                    navController.navigate(NavRoutes.PROFILE) {
                        popUpTo(NavRoutes.HOME) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }

        composable(NavRoutes.IMPACT) {
            // Placeholder for Impact Screen
            Text("Impact Screen Placeholder")
        }

        composable(NavRoutes.PROFILE) {
            // Placeholder for Profile Screen
            Text("Profile Screen Placeholder")
        }
    }
}
