# Conectar La Josefina a Supabase

La Josefina usa el proyecto compartido **Pequeños trabajos**. La base tiene una tabla `stores` para separar cada negocio; las reglas RLS permiten a cada dueño modificar solo el menú asociado a su cuenta. Los datos activos de cada carta son públicos para mostrarlos en su sitio.

## 1. Crear una cuenta de dueño

En **Authentication → Users**, creá manualmente el usuario del dueño de La Josefina con su correo y contraseña. Desactivá los registros públicos en la configuración de Auth para que no se creen cuentas desde la web. Copiá el **User UID** del usuario; no hace falta compartir su contraseña.

## 2. Preparar la base

1. Abrí **SQL Editor → New query** en el proyecto **Pequeños trabajos**.
2. Copiá y ejecutá una sola vez todo el archivo `supabase/setup.sql`. Crea las tablas compartidas, activa RLS y carga La Josefina con la carta actual.
3. En otra consulta, reemplazá el UUID por el **User UID** de la cuenta de dueño:

```sql
insert into public.menu_admins (user_id, store_id)
select 'PEGA-ACA-EL-USER-UID', id
from public.stores
where slug = 'la-josefina';
```

No vuelvas a ejecutar `setup.sql`: contiene la creación de tablas y la carga inicial de los productos.

## 3. Conectar esta web

En **Project Settings → API Keys**, copiá la **Project URL** y la clave **Publishable** (o la antigua `anon`). En Vercel, abrí **la-josefina-kappa → Settings → Environment Variables** y agregá estas variables para Production:

```text
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU-CLAVE-PUBLICABLE
NEXT_PUBLIC_STORE_SLUG=la-josefina
```

Guardá y volvé a desplegar. Para trabajar localmente, copiá `.env.example` a `.env.local`, completá los valores y reiniciá `npm run dev`.

La URL y la clave publicable están diseñadas para usarse en el navegador. **No agregues una clave `service_role` ni la contraseña de la base a estas variables.** La seguridad de las modificaciones se aplica en PostgreSQL mediante RLS y la lista privada `menu_admins`, no depende de ocultar la ruta `/admin`.

## Agregar otro cliente al mismo proyecto Supabase

Cada web debe usar un `NEXT_PUBLIC_STORE_SLUG` distinto. El usuario administrador de ese negocio se agrega a `menu_admins` con el `store_id` correspondiente. Los permisos de escritura se verifican contra ese negocio, así una cuenta no administra el menú de otro cliente. Las cartas activas son contenido público.
