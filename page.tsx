import React from "react";
import { connection } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { menu, type MenuSection } from "@/lib/menu-data";
import Image from "next/image";

function DishSection({ section, index }: { section: (typeof menu)[number]; index: number }) {
  return (
    <section className={`menu-card ${index % 3 === 1 ? "menu-card-tall" : ""}`} id={section.id}>
      <div className="card-heading">
        <span className="eyebrow">{String(index + 1).padStart(2, "0")} / LA CARTA</span>
        <h2>{section.title}</h2>
        <p>{section.note}</p>
      </div>
      <div className="dish-list">
        {section.items.map(([name, description, price]) => (
          <div className="dish" key={name}>
            <div className="dish-copy"><strong>{name}</strong>{description && <span>{description}</span>}</div>
            {price && <span className="price">{price}</span>}
          </div>
        ))}
      </div>
      {section.extras && <div className="empanada-prices">{section.extras.map(([label, price]) => <div key={label}><span>{label}</span><strong>{price}</strong></div>)}</div>}
    </section>
  );
}

async function loadMenu(): Promise<MenuSection[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const storeSlug = process.env.NEXT_PUBLIC_STORE_SLUG || "la-josefina";
  if (!url || !key) return menu;

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data: store, error: storeError } = await supabase.from("stores").select("id").eq("slug", storeSlug).eq("active", true).maybeSingle();
    if (storeError || !store) return menu;
    const [{ data: sections, error: sectionError }, { data: products, error: productError }] = await Promise.all([
      supabase.from("menu_sections").select("slug,title,description,position,active").eq("store_id", store.id).order("position"),
      supabase.from("menu_products").select("section_slug,name,description,price,kind,position,active").eq("store_id", store.id).order("position"),
    ]);
    if (sectionError || productError || !sections?.length || !products) return menu;

    return sections.filter((section) => section.active).map((section) => {
      const sectionProducts = products.filter((product) => product.section_slug === section.slug && product.active);
      return {
        id: section.slug,
        title: section.title,
        note: section.description,
        items: sectionProducts.filter((product) => product.kind === "dish").map((product) => [
          product.name,
          product.description ?? "",
          product.price === null ? "" : `$${Number(product.price).toLocaleString("es-AR")}`,
        ] as [string, string, string]),
        extras: sectionProducts.filter((product) => product.kind === "price_option").map((product) => [
          product.name,
          product.price === null ? "" : `$${Number(product.price).toLocaleString("es-AR")}`,
        ] as [string, string]),
      };
    });
  } catch {
    return menu;
  }
}

export default async function Page() {
  await connection();
  const liveMenu = await loadMenu();
  return (
    <main>
      <header className="hero">
        <div className="hero-glow" />
        <nav className="topbar"><a className="wordmark" href="#inicio"><span className="logo-frame"><Image src="/images/logo-la-josefina.jpg" alt="Logo de La Josefina" width={70} height={70} priority /></span><span>LA JOSEFINA<small>LOMITERÍA · CASA DE COMIDAS</small></span></a><div className="nav-actions"><a className="nav-cta" href="#carta">Ver la carta <span>↘</span></a><a className="admin-access" href="/admin" aria-label="Administración" title="Administración"><Image src="/images/logo-la-josefina.jpg" alt="" width={38} height={38} /></a></div></nav>
        <div className="hero-content" id="inicio">
          <span className="hero-kicker"><i /> HECHO CON GANAS, PARA COMPARTIR</span>
          <h1>El sabor de<br /><em>sentirse en casa.</em></h1>
          <p>Platos abundantes, clásicos que nunca fallan y algo rico para cada antojo.</p>
          <a href="#carta" className="primary-link">Explorar la carta <span>↓</span></a>
        </div>
        <div className="hero-logo"><Image src="/images/logo-la-josefina.jpg" alt="La Josefina Lomitería" width={420} height={420} priority /><span>AUTÉNTICO, CASERO Y NUESTRO</span></div>
        <div className="hero-bottom"><span>LOMITOS · PIZZAS · EMPANADAS</span><span>DESLIZÁ PARA DESCUBRIR <b>↓</b></span></div>
      </header>

      <section className="menu-wrap" id="carta">
        <div className="menu-intro"><div><span className="eyebrow">ALGO RICO TE ESTÁ ESPERANDO</span><h2>Nuestra carta<span>.</span></h2></div><p>Elegí tu clásico favorito. Todo preparado para que lo disfrutes.</p></div>
        <nav className="category-nav" aria-label="Categorías de la carta">{liveMenu.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}<span>↗</span></a>)}</nav>
        <div className="menu-grid">{liveMenu.map((section, index) => <DishSection key={section.id} section={section} index={index} />)}</div>
        <div className="menu-footnote"><span>✳</span><p>Precios expresados en pesos argentinos. Consultá disponibilidad al momento de pedir.</p></div>
      </section>
      <footer><a className="wordmark footer-mark" href="#inicio"><span className="logo-frame"><Image src="/images/logo-la-josefina.jpg" alt="" width={60} height={60} /></span><span>LA JOSEFINA<small>LOMITERÍA · CASA DE COMIDAS</small></span></a><span>Hecho con cariño, servido con abundancia.</span><a href="/admin">ADMINISTRAR CARTA</a><a href="#inicio">VOLVER ARRIBA ↑</a></footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap');
        :root{--ink:#10213c;--muted:#667080;--cream:#f4eedb;--paper:#fbf8ef;--orange:#bd922f;--line:#e6deca;--navy:#0c1d38;--gold:#d2a743}
        *{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:25px}body{margin:0;background:var(--paper);color:var(--ink);font-family:'DM Sans',sans-serif}a{color:inherit;text-decoration:none}
        .hero{min-height:690px;height:min(790px,94vh);background:var(--navy);color:#fbf6eb;position:relative;overflow:hidden;padding:0 7.2%;display:flex;flex-direction:column}.hero:before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 78% 48%,rgba(207,164,65,.25),transparent 35%),radial-gradient(ellipse at 72% 85%,rgba(189,146,47,.16),transparent 37%),linear-gradient(115deg,#08172f 15%,#102747 65%,#233451);}.hero:after{content:"";position:absolute;width:570px;height:570px;border:1px solid rgba(245,233,207,.14);border-radius:50%;right:6%;top:16%;box-shadow:0 0 0 28px rgba(245,233,207,.025),0 0 0 85px rgba(245,233,207,.025)}.hero-glow{position:absolute;width:440px;height:600px;right:11%;top:15%;opacity:.2;background:radial-gradient(ellipse,#e3c36d 0%,#b89037 34%,transparent 68%);filter:blur(30px)}
        .topbar,.hero-content,.hero-bottom,.hero-logo{position:relative;z-index:2}.topbar{height:100px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(247,240,222,.17)}.wordmark{display:flex;gap:11px;align-items:center;font-weight:700;font-size:14px;letter-spacing:1.6px}.wordmark small{display:block;font-size:8px;letter-spacing:2px;margin-top:4px;color:#d6d2c4;font-weight:500}.logo-frame{width:54px;height:54px;border-radius:50%;overflow:hidden;border:2px solid var(--gold);background:#f7f0da;display:block;flex-shrink:0}.logo-frame img{width:100%;height:100%;object-fit:cover}.nav-cta{font-size:12px;border:1px solid rgba(255,255,255,.4);padding:12px 17px;border-radius:3px}.nav-cta span{margin-left:12px;color:#e7c76f}.hero-content{margin:auto 0;max-width:640px;padding-bottom:18px}.hero-kicker,.eyebrow{font-size:9px;font-weight:700;letter-spacing:2px}.hero-kicker{color:#e4c46c;display:flex;align-items:center;gap:9px}.hero-kicker i{width:6px;height:6px;background:#e4c46c;border-radius:50%}.hero h1{font:500 clamp(58px,8vw,106px)/.99 'Playfair Display',serif;letter-spacing:-3px;margin:27px 0 24px}.hero h1 em{color:#e4c46c;font-weight:500}.hero-content>p{font-size:15px;line-height:1.8;color:#d4d8e0;max-width:380px;margin:0 0 29px}.primary-link{display:inline-flex;align-items:center;gap:27px;background:#d0a644;color:#10213c;padding:15px 19px;font-weight:700;font-size:12px;border-radius:2px}.primary-link span{font-size:17px}.hero-logo{position:absolute;z-index:1;right:10%;top:50%;transform:translateY(-46%);width:min(31vw,390px);text-align:center}.hero-logo img{width:100%;height:auto;border-radius:50%;border:5px solid #f7f0dc;box-shadow:0 0 0 2px var(--gold),0 24px 70px rgba(0,0,0,.27)}.hero-logo span{display:block;color:#e5cd8a;font-size:8px;letter-spacing:2.4px;margin-top:17px}.hero-bottom{padding:17px 0 21px;border-top:1px solid rgba(247,240,222,.17);display:flex;justify-content:space-between;color:#d0d3d9;font-size:8px;letter-spacing:1.8px}.hero-bottom b{color:#e4c46c;margin-left:9px;font-size:14px}
        .menu-wrap{max-width:1180px;margin:0 auto;padding:104px 38px 85px}.menu-intro{display:flex;justify-content:space-between;align-items:end;margin-bottom:34px}.eyebrow{color:var(--orange)}.menu-intro h2{font:600 clamp(44px,6vw,66px)/1.05 'Playfair Display',serif;letter-spacing:-1.8px;margin:13px 0 0}.menu-intro h2 span{color:var(--orange)}.menu-intro>p{color:var(--muted);max-width:260px;font-size:13px;line-height:1.8;margin-bottom:4px}.category-nav{display:flex;flex-wrap:wrap;gap:9px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:17px 0;margin-bottom:35px}.category-nav a{padding:9px 12px;background:#f1ecdc;border-radius:2px;font-size:10px;font-weight:600}.category-nav a span{color:var(--orange);margin-left:12px}.menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px}.menu-card{background:#fffefa;border:1px solid var(--line);padding:25px 28px 26px;position:relative;scroll-margin-top:20px}.menu-card:before{content:"";position:absolute;left:-1px;top:25px;height:27px;width:2px;background:var(--orange)}.card-heading{margin-bottom:17px}.card-heading .eyebrow{font-size:8px}.card-heading h2{font:600 31px/1.15 'Playfair Display',serif;letter-spacing:-.5px;margin:6px 0 5px}.card-heading p{font-size:11px;color:var(--muted);margin:0;line-height:1.5}.dish{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid #eeeae2;padding:12px 0}.dish-copy{display:flex;flex-direction:column;gap:4px;min-width:0}.dish-copy strong{font-size:12px;font-weight:700}.dish-copy span{font-size:10px;line-height:1.5;color:var(--muted);max-width:340px}.price{flex-shrink:0;color:var(--orange);font-size:12px;font-weight:700;white-space:nowrap}.empanada-prices{display:flex;gap:8px;margin-top:9px;flex-wrap:wrap}.empanada-prices div{flex:1;min-width:92px;display:flex;flex-direction:column;gap:6px;background:#f3efe7;padding:11px 12px}.empanada-prices span{font-size:9px;color:var(--muted)}.empanada-prices strong{font-size:12px;color:var(--orange)}.menu-footnote{display:flex;gap:13px;align-items:center;margin:25px 0 0;color:var(--muted);font-size:10px}.menu-footnote span{font-size:22px;color:var(--orange)}footer{border-top:1px solid var(--line);padding:27px 7.2%;display:flex;align-items:center;justify-content:space-between;gap:15px}footer>span{font-size:10px;color:var(--muted)}footer>a:last-child{font-size:8px;letter-spacing:1.4px;font-weight:700;color:var(--orange)}.footer-mark{font-size:12px}.footer-mark .logo-frame{width:42px;height:42px}
        @media(max-width:700px){.hero{height:740px;min-height:650px;max-height:92svh;padding:0 23px}.hero:after{right:-55%;top:22%;width:480px;height:480px}.hero-glow{right:-26%;top:23%}.topbar{height:76px}.wordmark{font-size:11px}.wordmark small{font-size:7px}.logo-frame{width:42px;height:42px}.nav-cta{padding:10px 12px;font-size:10px}.hero-content{margin: auto 0;max-width:75%;}.hero h1{font-size:clamp(58px,14vw,83px);letter-spacing:-2.5px;margin:24px 0 19px}.hero-content>p{font-size:13px;max-width:290px}.hero-logo{width:142px;right:22px;top:57%;transform:none}.hero-logo img{border-width:3px}.hero-logo span{font-size:6px;letter-spacing:1px;margin-top:9px}.hero-bottom{font-size:7px;letter-spacing:1px}.menu-wrap{padding:70px 19px 56px}.menu-intro{display:block;margin-bottom:23px}.menu-intro>p{margin:12px 0 0;font-size:12px}.category-nav{flex-wrap:nowrap;overflow-x:auto;white-space:nowrap;margin-right:-19px;padding-right:19px;scrollbar-width:none}.category-nav::-webkit-scrollbar{display:none}.menu-grid{grid-template-columns:1fr;gap:12px}.menu-card{padding:22px 21px}.card-heading h2{font-size:29px}footer{padding:22px 19px;flex-wrap:wrap}footer>span{order:3;width:100%}}
        @media(min-width:1000px){.menu-card-tall{grid-row:span 1}.menu-grid .menu-card:nth-child(4){grid-row:span 2}.menu-grid .menu-card:nth-child(6){grid-column:span 2}.menu-grid .menu-card:nth-child(10){grid-column:span 2}.menu-grid .menu-card:nth-child(10) .dish-list{display:grid;grid-template-columns:1fr 1fr;column-gap:28px}}
      `}</style>
      <style>{`
        .nav-actions{display:flex;align-items:center;gap:10px}.admin-access{width:38px;height:38px;display:grid;place-items:center;overflow:hidden;border-radius:50%;border:1px solid rgba(231,199,111,.55);background:#f7f0da;opacity:.82;transition:opacity .2s,transform .2s,border-color .2s;flex-shrink:0}.admin-access img{width:100%;height:100%;object-fit:cover}.admin-access:hover,.admin-access:focus-visible{opacity:1;transform:scale(1.06);border-color:#e7c76f}.admin-access:focus-visible{outline:2px solid #e7c76f;outline-offset:3px}
        @media(max-width:700px){.admin-access{width:34px;height:34px}.nav-actions{gap:8px}}
      `}</style>
    </main>
  );
}
