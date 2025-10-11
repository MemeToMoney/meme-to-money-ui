# CORS Configuration Fix for Spring Boot Backend

## Problem
Browser requests fail with CORS preflight errors while Postman works because browsers send OPTIONS requests that the backend rejects.

## Solution
Add this CORS configuration to your Spring Boot application:

### Method 1: Global CORS Configuration Class

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
```

### Method 2: Controller Level (Add to each controller)

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = "http://localhost:3000",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class AuthController {
    // Your existing controller methods...
}
```

### Method 3: Security Configuration (If using Spring Security)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("http://localhost:3000/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

## Key Points:
1. **Allow OPTIONS method** - This is crucial for preflight requests
2. **Set allowed origins** to "http://localhost:3000"
3. **Allow all headers** with "*"
4. **Set allowCredentials to false** unless you need cookies
5. **Apply to all /api/** endpoints**

## Testing:
After adding the configuration, test with:
```bash
curl -X OPTIONS 'http://localhost:8080/api/auth/login' \
  -H 'Origin: http://localhost:3000' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type'
```

Should return 200 OK with CORS headers.