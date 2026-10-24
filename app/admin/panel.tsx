"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, storeSlug } from "@/lib/supabase-browser";

type Section = { slug: string; title: string; description: string; position: number; active: boolean };
type Product = {
  id: string;
  section_slug: string;
  name: string;
  description: string;
  price: number | null;
  kind: "dish" | "price_option";
  position: number;
  active: boolean;
};
type ProductDraft = { id?: string; section_slug: string; name: string; description: string; price: string; kind: "dish" | "price_option" };
const emptyProduct = (slug = ""): ProductDraft => ({ section_slug: slug, name: "", description: "", price: "", kind: "dish" });

function friendlyError(message: string) {
  if (/invalid login credentials/i.test(message)) return "El correo o la contraseña no son correctos.";
  if (/failed to fetch|network/i.test(message)) return "No se pudo conectar. Revisá la conexión e intentá de nuevo.";
  if (/row-level security|permission denied|not allowed/i.test(message)) return "Esta cuenta no tiene permiso de administrador.";
  return message;
}

export default function AdminPanel() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [configured, setConfigured] = useState(true);
  const [checking, setChecking] = useState(true);
  const [owner, setOwner] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [productDraft, setProductDraft] = useState<ProductDraft | null>(null);
  const [sectionDraft, setSectionDraft] = useState<Pick<Section, "slug" | "title" | "description"> | null>(null);

  const loadCatalog = useCallback(async (supabase: SupabaseClient, currentStoreId: string) => {
    const [{ data: sectionRows, error: sectionError }, { data: productRows, error: productError }] = await Promise.all([
      supabase.from("menu_sections").select("slug,title,description,position,active").eq("store_id", currentStoreId).order("position"),
      supabase.from("menu_products").select("id,section_slug,name,description,price,kind,position,active").eq("store_id", currentStoreId).order("position"),
    ]);
    if (sectionError) throw sectionError;
    if (productError) throw productError;
    const nextSections = (sectionRows ?? []) as Section[];
    setSections(nextSections);
    setProducts((productRows ?? []) as Product[]);
    setSelectedSlug((current) => nextSections.some((section) => section.slug === current) ? current : nextSections[0]?.slug ?? "");
  }, []);

  const verifyOwner = useCallback(async (supabase: SupabaseClient, currentStoreId: string, userEmail?: string) => {
    setChecking(true);
    const { data, error } = await supabase.rpc("is_menu_admin", { p_store_id: currentStoreId });
    if (error || data !== true) {
      await supabase.auth.signOut();
      setOwner(false);
      setChecking(false);
      setMessage(error ? friendlyError(error.message) : "Esta cuenta no tiene permisos de administrador.");
      return;
    }
    setOwner(true);
    if (userEmail) setEmail(userEmail);
    try {
      await loadCatalog(supabase, currentStoreId);
      setMessage("");
    } catch (error) {
      setMessage(friendlyError(error instanceof Error ? error.message : "No se pudo cargar la carta."));
    } finally {
      setChecking(false);
    }
  }, [loadCatalog]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setConfigured(false);
      setChecking(false);
      return;
    }
    setClient(supabase);
    void (async () => {
      const { data: store, error: storeError } = await supabase.from("stores").select("id").eq("slug", storeSlug).eq("active", true).maybeSingle();
      if (storeError || !store) {
        setConfigured(false);
        setMessage(`No encontramos la tienda “${storeSlug}” en Supabase.`);
        setChecking(false);
        return;
      }
      setStoreId(store.id);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMessage(friendlyError(error.message));
        setChecking(false);
      } else if (data.session) {
        void verifyOwner(supabase, store.id, data.session.user.email);
      } else {
        setChecking(false);
      }
    })();
  }, [verifyOwner]);

  const selectedSection = sections.find((section) => section.slug === selectedSlug);
  const selectedProducts = useMemo(() => products.filter((product) => product.section_slug === selectedSlug).sort((a, b) => a.position - b.position), [products, selectedSlug]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    setBusy(true);
    setMessage("");
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(friendlyError(error.message));
      setBusy(false);
      return;
    }
    setPassword("");
    await verifyOwner(client, storeId, data.user.email);
    setBusy(false);
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    setOwner(false);
    setSections([]);
    setProducts([]);
    setMessage("");
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || !productDraft) return;
    const name = productDraft.name.trim();
    const price = productDraft.price.trim() ? Number(productDraft.price.replace(/[^\d]/g, "")) : null;
    if (!name || !productDraft.section_slug || (price !== null && (!Number.isSafeInteger(price) || price < 0))) {
      setMessage("Revisá el nombre, la sección y el precio del producto.");
      return;
    }
    setBusy(true);
    setMessage("");
    const payload = { store_id: storeId, section_slug: productDraft.section_slug, name, description: productDraft.description.trim(), price, kind: productDraft.kind };
    const result = productDraft.id
      ? await client.from("menu_products").update(payload).eq("store_id", storeId).eq("id", productDraft.id)
      : await client.from("menu_products").insert({ ...payload, position: products.filter((product) => product.section_slug === productDraft.section_slug).length, active: true });
    if (result.error) setMessage(friendlyError(result.error.message));
    else {
      setProductDraft(null);
      await loadCatalog(client, storeId);
      setMessage("Producto guardado. La carta pública ya está actualizada.");
    }
    setBusy(false);
  }

  async function saveSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || !sectionDraft) return;
    const title = sectionDraft.title.trim();
    const description = sectionDraft.description.trim();
    const slug = sectionDraft.slug || title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!title || !slug) { setMessage("Escribí un nombre para la sección."); return; }
    if (!sectionDraft.slug && sections.some((section) => section.slug === slug)) { setMessage("Ya existe una sección con ese nombre. Elegí otro título."); return; }
    setBusy(true);
    setMessage("");
    const result = sectionDraft.slug
      ? await client.from("menu_sections").update({ title, description }).eq("store_id", storeId).eq("slug", sectionDraft.slug)
      : await client.from("menu_sections").insert({ store_id: storeId, slug, title, description, position: sections.length, active: true });
    if (result.error) setMessage(friendlyError(result.error.message));
    else {
      setSectionDraft(null);
      setSelectedSlug(slug);
      await loadCatalog(client, storeId);
      setMessage("Sección guardada.");
    }
    setBusy(false);
  }

  async function toggleProduct(product: Product) {
    if (!client) return;
    setBusy(true);
    const { error } = await client.from("menu_products").update({ active: !product.active }).eq("store_id", storeId).eq("id", product.id);
    if (error) setMessage(friendlyError(error.message)); else await loadCatalog(client, storeId);
    setBusy(false);
  }

  async function toggleSection(section: Section) {
    if (!client) return;
    setBusy(true);
    const { error } = await client.from("menu_sections").update({ active: !section.active }).eq("store_id", storeId).eq("slug", section.slug);
    if (error) setMessage(friendlyError(error.message)); else await loadCatalog(client, storeId);
    setBusy(false);
  }

  async function deleteProduct(product: Product) {
    if (!client || !window.confirm(`¿Eliminar “${product.name}” de la carta?`)) return;
    setBusy(true);
    const { error } = await client.from("menu_products").delete().eq("store_id", storeId).eq("id", product.id);
    if (error) setMessage(friendlyError(error.message)); else { await loadCatalog(client, storeId); setMessage("Producto eliminado."); }
    setBusy(false);
  }

  async function deleteSection(section: Section) {
    if (!client) return;
    const sectionProducts = products.filter((product) => product.section_slug === section.slug);
    const productsSummary = sectionProducts.length === 1 ? " y su único producto" : sectionProducts.length ? ` y sus ${sectionProducts.length} productos` : "";
    if (!window.confirm(`¿Eliminar la sección “${section.title}”${productsSummary}? Esta acción no se puede deshacer.`)) return;

    setBusy(true);
    setMessage("");
    if (sectionProducts.length) {
      const { error } = await client.from("menu_products").delete().eq("store_id", storeId).eq("section_slug", section.slug);
      if (error) {
        setMessage(friendlyError(error.message));
        setBusy(false);
        return;
      }
    }

    const { error } = await client.from("menu_sections").delete().eq("store_id", storeId).eq("slug", section.slug);
    if (error) {
      setMessage(sectionProducts.length
        ? `No se pudo eliminar la sección. Sus productos ya fueron eliminados: ${friendlyError(error.message)}`
        : friendlyError(error.message));
    } else {
      setSectionDraft(null);
      setProductDraft(null);
      await loadCatalog(client, storeId);
      setMessage(`Sección “${section.title}” eliminada.`);
    }
    setBusy(false);
  }

  async function moveProduct(product: Product, direction: -1 | 1) {
    if (!client) return;
    const index = selectedProducts.findIndex((entry) => entry.id === product.id);
    const other = selectedProducts[index + direction];
    if (!other) return;
    setBusy(true);
    const first = await client.from("menu_products").update({ position: other.position }).eq("store_id", storeId).eq("id", product.id);
    const second = await client.from("menu_products").update({ position: product.position }).eq("store_id", storeId).eq("id", other.id);
    if (first.error || second.error) setMessage(friendlyError(first.error?.message ?? second.error?.message ?? "No se pudo cambiar el orden."));
    else await loadCatalog(client, storeId);
    setBusy(false);
  }

  return (
    <main className="admin-shell">
      <header className="admin-top"><Link href="/" className="admin-brand"><span><Image src="/images/logo-la-josefina.jpg" alt="" width={50} height={50} /></span><b>LA JOSEFINA<small>ADMINISTRACIÓN DE CARTA</small></b></Link><Link href="/" className="back-link">← Volver a la carta</Link></header>
      {checking ? <div className="admin-status">Verificando acceso…</div> : !configured ? <section className="admin-login"><span className="admin-kicker">PANEL DEL DUEÑO</span><h1>Falta conectar Supabase</h1><p>El panel está preparado, pero necesita un proyecto de base de datos. Seguí los pasos de <code>SUPABASE_SETUP.md</code> y cargá las variables de entorno.</p></section> : !owner ? (
        <section className="admin-login"><span className="admin-kicker">PANEL DEL DUEÑO</span><h1>Administrá tu carta.</h1><p>Ingresá con la cuenta de dueño que fue habilitada para este panel.</p><form onSubmit={signIn}><label>Correo electrónico<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button className="admin-primary" disabled={busy}>{busy ? "Ingresando…" : "Ingresar"}</button></form>{message && <p className="admin-message" role="alert">{message}</p>}</section>
      ) : (
        <section className="admin-content"><div className="admin-heading"><div><span className="admin-kicker">PANEL DEL DUEÑO</span><h1>Tu carta, a tu manera.</h1><p>Los cambios se guardan directamente y aparecen en la página pública.</p></div><div className="account-area"><span>{email}</span><button className="quiet-button" onClick={signOut}>Cerrar sesión</button></div></div>
          {message && <p className="admin-message" role="status">{message}</p>}
          <div className="admin-layout"><aside className="section-side"><div className="side-title"><h2>Secciones</h2><button className="add-button" onClick={() => setSectionDraft({ slug: "", title: "", description: "" })}>+ Nueva</button></div>{sections.map((section) => <div className={`section-row ${selectedSlug === section.slug ? "selected" : ""}`} key={section.slug}><button className="section-select" onClick={() => { setSelectedSlug(section.slug); setProductDraft(null); }}>{section.title}<small>{products.filter((product) => product.section_slug === section.slug && product.active).length} productos{!section.active ? " · oculta" : ""}</small></button><button className="icon-button" aria-label={`Editar ${section.title}`} onClick={() => setSectionDraft({ slug: section.slug, title: section.title, description: section.description })}>✎</button></div>)}</aside>
            <div className="product-area">{sectionDraft ? <form className="editor-card" onSubmit={saveSection}><div className="form-title"><div><span className="admin-kicker">SECCIÓN</span><h2>{sectionDraft.slug ? "Editar sección" : "Nueva sección"}</h2></div><button type="button" className="icon-button" onClick={() => setSectionDraft(null)}>×</button></div><label>Nombre<input value={sectionDraft.title} onChange={(event) => setSectionDraft({ ...sectionDraft, title: event.target.value })} placeholder="Por ejemplo: Meriendas" required /></label><label>Descripción breve<input value={sectionDraft.description} onChange={(event) => setSectionDraft({ ...sectionDraft, description: event.target.value })} placeholder="Una frase que acompaña la categoría" /></label><div className="form-actions"><button type="button" className="quiet-button" onClick={() => setSectionDraft(null)}>Cancelar</button><button className="admin-primary" disabled={busy}>{busy ? "Guardando…" : "Guardar sección"}</button></div></form> : productDraft ? <form className="editor-card" onSubmit={saveProduct}><div className="form-title"><div><span className="admin-kicker">PRODUCTO</span><h2>{productDraft.id ? "Editar producto" : "Agregar a la carta"}</h2></div><button type="button" className="icon-button" onClick={() => setProductDraft(null)}>×</button></div><label>Sección<select value={productDraft.section_slug} onChange={(event) => setProductDraft({ ...productDraft, section_slug: event.target.value })}>{sections.map((section) => <option key={section.slug} value={section.slug}>{section.title}</option>)}</select></label><label>Nombre<input value={productDraft.name} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })} placeholder="Nombre del producto" required /></label><label>Descripción o ingredientes<input value={productDraft.description} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} placeholder="Opcional" /></label><div className="form-pair"><label>Precio en pesos<input type="number" min="0" step="1" value={productDraft.price} onChange={(event) => setProductDraft({ ...productDraft, price: event.target.value })} placeholder="Ej. 8500" /></label><label>Tipo<select value={productDraft.kind} onChange={(event) => setProductDraft({ ...productDraft, kind: event.target.value as ProductDraft["kind"] })}><option value="dish">Producto</option><option value="price_option">Opción o tamaño</option></select></label></div><div className="form-actions"><button type="button" className="quiet-button" onClick={() => setProductDraft(null)}>Cancelar</button><button className="admin-primary" disabled={busy}>{busy ? "Guardando…" : "Guardar producto"}</button></div></form> : <>
                <div className="catalog-heading"><div><span className="admin-kicker">SECCIÓN SELECCIONADA</span><h2>{selectedSection?.title ?? "Elegí una sección"}</h2><p>{selectedSection?.description}</p></div>{selectedSection && <div className="catalog-actions"><button className="quiet-button" onClick={() => setSectionDraft({ slug: selectedSection.slug, title: selectedSection.title, description: selectedSection.description })}>Editar sección</button><button className="quiet-button" onClick={() => toggleSection(selectedSection)}>{selectedSection.active ? "Ocultar" : "Publicar"} sección</button><button className="admin-primary" onClick={() => setProductDraft(emptyProduct(selectedSection.slug))}>+ Agregar producto</button><button className="quiet-button delete-section-button" disabled={busy} onClick={() => deleteSection(selectedSection)}>Eliminar sección</button></div>}</div>
                {!selectedSection ? <div className="empty-state"><span>✳</span><h3>No hay secciones en la carta</h3><p>Creá una sección para empezar a cargar productos.</p><button className="admin-primary" onClick={() => setSectionDraft({ slug: "", title: "", description: "" })}>+ Crear sección</button></div> : selectedProducts.length ? <div className="product-list">{selectedProducts.map((product, index) => <article className={`product-row ${!product.active ? "inactive" : ""}`} key={product.id}><div className="product-info"><strong>{product.name}</strong><span>{product.description || (product.kind === "price_option" ? "Opción o tamaño" : "Sin descripción")}</span></div><div className="product-price">{product.price === null ? "Consultar" : `$${product.price.toLocaleString("es-AR")}`}</div><div className="product-actions"><button className="icon-button" disabled={busy || index === 0} onClick={() => moveProduct(product, -1)} aria-label={`Subir ${product.name}`}>↑</button><button className="icon-button" disabled={busy || index === selectedProducts.length - 1} onClick={() => moveProduct(product, 1)} aria-label={`Bajar ${product.name}`}>↓</button><button className="icon-button" onClick={() => setProductDraft({ id: product.id, section_slug: product.section_slug, name: product.name, description: product.description, price: product.price?.toString() ?? "", kind: product.kind })} aria-label={`Editar ${product.name}`}>✎</button><button className="icon-button danger" onClick={() => toggleProduct(product)}>{product.active ? "Ocultar" : "Mostrar"}</button><button className="icon-button danger" aria-label={`Eliminar ${product.name}`} onClick={() => deleteProduct(product)}>×</button></div></article>)}</div> : <div className="empty-state"><span>✳</span><h3>Esta sección todavía está vacía</h3><p>Agregá el primer producto para empezar.</p><button className="admin-primary" onClick={() => setProductDraft(emptyProduct(selectedSlug))}>+ Agregar producto</button></div>}
              </>}</div>
          </div>
        </section>
      )}
      <footer className="admin-footer"><span>La Josefina · Administración segura de la carta</span><Link href="/">Ver sitio público ↗</Link></footer>
      <style>{`
        :root{--admin-ink:#10213c;--admin-muted:#667080;--admin-paper:#fbf8ef;--admin-line:#e6deca;--admin-gold:#bd922f;--admin-navy:#0c1d38}
        *{box-sizing:border-box}.admin-shell{min-height:100vh;background:var(--admin-paper);color:var(--admin-ink);font-family:'DM Sans',Arial,sans-serif;padding:0 6.5% 24px}.admin-top{height:90px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--admin-line)}.admin-brand{display:flex;align-items:center;gap:12px;letter-spacing:1.6px;font-size:12px}.admin-brand>span{display:grid;place-items:center;background:#f7f0da;border:2px solid var(--admin-gold);width:48px;height:48px;border-radius:50%;overflow:hidden;flex-shrink:0}.admin-brand>span img{width:100%;height:100%;object-fit:cover}.admin-brand small{display:block;color:var(--admin-muted);font:600 8px Arial;letter-spacing:1.7px;margin-top:4px}.back-link,.admin-footer a{font-size:11px;color:var(--admin-muted);text-decoration:none}.admin-login{max-width:450px;margin:10vh auto 12vh;background:white;padding:42px;border:1px solid var(--admin-line);box-shadow:0 15px 50px rgba(34,44,54,.06)}.admin-login h1,.admin-heading h1{font:600 38px/1.1 'Playfair Display',Georgia,serif;margin:13px 0}.admin-login>p,.admin-heading p{color:var(--admin-muted);font-size:13px;line-height:1.7}.admin-login form,.editor-card{display:grid;gap:17px;margin-top:25px}.admin-login label,.editor-card label{display:grid;gap:7px;color:var(--admin-muted);font-size:11px;font-weight:600}.admin-login input,.editor-card input,.editor-card select{height:44px;border:1px solid var(--admin-line);background:#fffefa;padding:0 12px;font:13px 'DM Sans',Arial;color:var(--admin-ink);outline-color:var(--admin-gold)}.admin-primary,.add-button,.quiet-button,.icon-button{border:0;cursor:pointer;font-family:inherit}.admin-primary{padding:12px 16px;background:var(--admin-navy);color:#fff;font-size:11px;font-weight:700;letter-spacing:.2px}.admin-primary:disabled{opacity:.55;cursor:wait}.admin-login .admin-primary{height:46px}.quiet-button{padding:10px 12px;background:#f3efe3;color:var(--admin-ink);font-size:10px;font-weight:600}.admin-message{padding:12px 14px;background:#f5eedb;color:#715819;font-size:11px;line-height:1.5}.admin-status{max-width:1000px;margin:15vh auto;text-align:center;color:var(--admin-muted)}.admin-content{max-width:1240px;margin:65px auto 50px}.admin-heading{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:34px}.admin-kicker{font-size:8px;font-weight:700;letter-spacing:2px;color:var(--admin-gold)}.admin-heading h1{margin-bottom:8px}.admin-heading p{margin:0}.account-area{display:flex;align-items:center;gap:13px;color:var(--admin-muted);font-size:10px}.admin-layout{display:grid;grid-template-columns:255px minmax(0,1fr);gap:20px;align-items:start}.section-side,.editor-card,.catalog-heading,.product-list,.empty-state{background:white;border:1px solid var(--admin-line)}.section-side{padding:15px}.side-title,.form-title{display:flex;align-items:center;justify-content:space-between}.side-title h2{font:600 20px 'Playfair Display',Georgia,serif;margin:7px 0 13px}.add-button{padding:8px 9px;background:#f2e8c8;color:#705719;font-size:10px;font-weight:700}.section-row{display:flex;align-items:center;border-top:1px solid #f0ece2}.section-row.selected{background:#f8f4e8}.section-select{flex:1;text-align:left;border:0;background:transparent;padding:12px 9px;color:var(--admin-ink);font:600 12px 'DM Sans',Arial;cursor:pointer}.section-select small{display:block;color:var(--admin-muted);font-size:9px;font-weight:400;margin-top:4px}.icon-button{min-width:31px;height:31px;background:transparent;color:var(--admin-muted);font-size:14px}.icon-button:disabled{opacity:.3;cursor:default}.icon-button.danger{font-size:9px;font-weight:600}.product-area{min-width:0}.catalog-heading{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:20px 23px;margin-bottom:12px}.catalog-heading h2,.form-title h2{font:600 27px 'Playfair Display',Georgia,serif;margin:5px 0}.catalog-heading p{font-size:11px;color:var(--admin-muted);margin:5px 0 0}.catalog-actions{display:flex;flex-wrap:wrap;gap:7px;justify-content:end}.catalog-actions .admin-primary{white-space:nowrap}.product-list{padding:0 18px}.product-row{display:grid;grid-template-columns:minmax(150px,1fr) 100px auto;align-items:center;gap:14px;border-bottom:1px solid #f0ece2;padding:13px 2px}.product-row:last-child{border-bottom:0}.product-row.inactive{opacity:.52}.product-info{display:grid;gap:4px}.product-info strong{font-size:12px}.product-info span{font-size:10px;color:var(--admin-muted);line-height:1.4}.product-price{color:var(--admin-gold);font-size:12px;font-weight:700}.product-actions{display:flex;align-items:center;gap:1px}.editor-card{max-width:650px;padding:25px}.form-title{margin-bottom:5px}.form-title h2{font-size:25px}.form-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form-actions{display:flex;justify-content:end;gap:8px;padding-top:6px}.empty-state{text-align:center;padding:45px 20px}.empty-state>span{color:var(--admin-gold);font-size:25px}.empty-state h3{font:600 22px 'Playfair Display',Georgia,serif;margin:10px}.empty-state p{color:var(--admin-muted);font-size:11px}.admin-footer{max-width:1240px;margin:60px auto 0;padding-top:18px;border-top:1px solid var(--admin-line);display:flex;justify-content:space-between;color:var(--admin-muted);font-size:9px}
        @media(max-width:850px){.admin-shell{padding:0 18px 20px}.admin-content{margin:38px auto}.admin-heading{align-items:start;flex-direction:column}.account-area{width:100%;justify-content:space-between}.admin-layout{grid-template-columns:1fr}.section-side{max-height:265px;overflow:auto}.catalog-heading{align-items:start;flex-direction:column}.catalog-actions{justify-content:start}.product-row{grid-template-columns:minmax(130px,1fr) 76px}.product-actions{grid-column:1/-1;justify-content:end;border-top:1px solid #f0ece2;padding-top:5px}.admin-login{margin:9vh auto;padding:28px}.admin-footer{margin-top:42px}}
      `}</style>
      <style>{`.delete-section-button{color:#963f35;background:#f8ece8}`}</style>
    </main>
  );
}
