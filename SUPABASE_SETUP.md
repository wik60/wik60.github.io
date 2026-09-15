# Podłączenie logowania i synchronizacji

1. Załóż bezpłatny projekt na https://supabase.com.
2. Otwórz **SQL Editor**, wklej zawartość pliku `supabase-setup.sql` i uruchom.
3. Wejdź w **Project Settings → API**.
4. Skopiuj `Project URL` oraz `Publishable key` do pliku `config.js`.
5. W **Authentication → URL Configuration** dodaj adres strony z GitHub Pages jako `Site URL` i `Redirect URL`.
6. Wrzuć pliki `index.html`, `styles.css`, `app.js` i `config.js` na GitHub Pages.

Klucz `Publishable` może być publiczny, ponieważ dostęp do danych ograniczają zasady RLS. Nigdy nie umieszczaj w repozytorium klucza `Secret` ani `service_role`.
