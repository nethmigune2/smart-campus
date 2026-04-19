package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService) {
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .oauth2Login(oauth -> oauth
                .userInfoEndpoint(userInfo ->
                    userInfo.userService(customOAuth2UserService)
                )
                .successHandler((request, response, authentication) ->
                    response.sendRedirect("http://localhost:5173/auth/callback")
                )
                .failureHandler((request, response, exception) ->
                    response.sendRedirect("http://localhost:5173/login?error=oauth_failed")
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/error").permitAll()
                // Public read access to resources catalogue
                .requestMatchers(HttpMethod.GET, "/api/resources", "/api/resources/**").permitAll()
                // Auth endpoints and OAuth2 flow are public
                .requestMatchers("/api/auth/**", "/oauth2/**", "/login/**").permitAll()
                // Mutating resource endpoints require authentication
                .requestMatchers(HttpMethod.POST,   "/api/resources/**").authenticated()
                .requestMatchers(HttpMethod.PUT,    "/api/resources/**").authenticated()
                .requestMatchers(HttpMethod.PATCH,  "/api/resources/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/resources/**").authenticated()
                // All booking endpoints require authentication
                .requestMatchers("/api/bookings/**").authenticated()
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
