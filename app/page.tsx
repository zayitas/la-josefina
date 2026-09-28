import React from "react";

const menu = [
  {
    id: "lomitos", title: "Lomitos", note: "Carne tierna, pan calentito y mucho sabor.", items: [
      ["Común", "Mayonesa y queso", "$8.000"],
      ["Especial", "Lechuga, tomate, jamón, queso, huevo y mayonesa", "$10.000"],
      ["Súper", "Lechuga, tomate, jamón, queso, huevo, mayonesa y roquefort", "$12.000"],
    ],
  },
  {
    id: "hamburguesas", title: "Hamburguesas", note: "Hechas para disfrutar hasta el último bocado.", items: [
      ["Común", "Mayonesa y queso", "$6.000"],
      ["Especial", "Lechuga, tomate, jamón, queso, huevo y mayonesa", "$8.000"],
      ["Súper", "Lechuga, tomate, jamón, queso, huevo, mayonesa, roquefort y 2 patys", "$13.000"],
    ],
  },
  {
    id: "tostados", title: "Tostados", note: "Doraditos, abundantes y recién hechos.", items: [
      ["Común", "Triple de jamón y queso", "$6.000"],
      ["Especial primavera", "Jamón, queso, lechuga, tomate, huevo y mayonesa", "$7.000"],
    ],
  },
  {
    id: "picadas", title: "Picadas", note: "Para compartir. Papas fritas, milanesas, aceitunas, pan y aderezos.", items: [
      ["Para 2 personas", "Una picada completa para compartir", "$18.000"],
      ["Para 4 personas", "Una picada completa para compartir", "$32.000"],
      ["Súper pancho", "", "$3.500"],
    ],
  },
  {
    id: "milanesas", title: "Milanesas", note: "Con guarnición de papas fritas.", items: [
      ["Mila con papas", "", "$12.000"], ["Mila napolitana", "", "$14.000"], ["Fugazzeta", "", "$14.000"],
      ["Caballo", "", "$14.000"], ["Cuatro queso", "", "$14.000"], ["Americana", "", "$14.000"],
    ],
  },
  {
    id: "sandwiches", title: "Sándwiches de milanesa", note: "Elegí tu favorito, siempre bien completo.", items: [
      ["Común", "Lechuga, tomate y mayonesa", "$8.000"],
      ["Especial", "Lechuga, tomate, jamón, queso, huevo y mayonesa", "$10.000"],
      ["De marinera", "Lechuga, tomate y mayonesa", "$8.000"],
    ],
  },
  {
    id: "pizzas", title: "Pizzas", note: "Clásicas para cualquier plan.", items: [
      ["Muzza", "", "$10.000"], ["Napolitana", "", "$12.000"], ["Calabresa", "", "$14.000"], ["Especial", "", "$14.000"],
      ["Roquefort", "", "$14.000"], ["Rúcula", "", "$14.000"], ["Huevo frito", "", "$14.000"], ["La Josefina", "", "$15.000"],
    ],
  },
  {
    id: "empanadas", title: "Empanadas", note: "Elegí tus gustos favoritos.", items: [
      ["Carne", "", ""], ["Carne cortada a cuchillo", "", ""], ["Jamón y queso", "", ""], ["Cebolla y queso", "", ""],
      ["Choclo y queso", "", ""], ["Acelga y queso", "", ""], ["Pollo", "", ""], ["Capresse", "", ""], ["Roquefort", "", ""],
    ],
    extras: [["La docena", "$14.000"], ["Unidad", "$1.200"], ["20 surtidas", "$20.000"]],
  },
  {
    id: "papas", title: "Papas fritas", note: "Para picar, compartir o no compartir.", items: [
      ["Papas fritas", "", "$7.000"], ["Papas americanas", "", "$10.000"], ["Salchipapas", "", "$10.000"],
      ["Hamburpapas", "", "$10.000"], ["Lomipapas", "", "$10.000"],
    ],
  },
  {
    id: "promos", title: "Promos", note: "Un plan rico, resuelto.", items: [
      ["2 hamburguesas especiales + papas", "", "$14.000"], ["2 lomitos especiales + papas", "", "$18.000"],
      ["2 sándwiches de mila especiales + papas", "", "$18.000"], ["2 milanesas con papas", "", "$20.000"],
      ["1 pizza + 6 empanadas + papas", "", "$20.000"], ["2 pizzas muzza", "", "$18.000"],
      ["20 empanadas surtidas", "", "$20.000"], ["20 empanadas a elección", "", "$20.000"],
      ["2 panchos + 2 vasitos de Coca", "", "$6.000"],
    ],
  },
];

const categories = ["Lomitos", "Hamburguesas", "Pizzas", "Empanadas", "Milanesas", "Papas fritas", "Promos"];

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

export default function Page() {
  return (
    <main>
      <header className="hero">
        <div className="hero-glow" />
        <nav className="topbar"><a className="wordmark" href="#inicio"><span className="mark">J</span><span>LA JOSEFINA<small>LOMITERÍA · CASA DE COMIDAS</small></span></a><a className="nav-cta" href="#carta">Ver la carta <span>↘</span></a></nav>
        <div className="hero-content" id="inicio">
          <span className="hero-kicker"><i /> HECHO CON GANAS, PARA COMPARTIR</span>
          <h1>El sabor de<br /><em>sentirse en casa.</em></h1>
          <p>Platos abundantes, clásicos que nunca fallan y algo rico para cada antojo.</p>
          <a href="#carta" className="primary-link">Explorar la carta <span>↓</span></a>
          <div className="hero-stamp"><span>BUENO<br />Y CASERO</span><b>✳</b></div>
        </div>
        <div className="hero-bottom"><span>LOMITOS · PIZZAS · EMPANADAS</span><span>DESLIZÁ PARA DESCUBRIR <b>↓</b></span></div>
      </header>

      <section className="menu-wrap" id="carta">
        <div className="menu-intro"><div><span className="eyebrow">ALGO RICO TE ESTÁ ESPERANDO</span><h2>Nuestra carta<span>.</span></h2></div><p>Elegí tu clásico favorito. Todo preparado para que lo disfrutes.</p></div>
        <nav className="category-nav" aria-label="Categorías de la carta">{categories.map((name) => { const id = name.toLowerCase().replaceAll(" ", "-"); return <a key={name} href={`#${id}`}>{name}<span>↗</span></a>; })}</nav>
        <div className="menu-grid">{menu.map((section, index) => <DishSection key={section.id} section={section} index={index} />)}</div>
        <div className="menu-footnote"><span>✳</span><p>Precios expresados en pesos argentinos. Consultá disponibilidad al momento de pedir.</p></div>
      </section>
      <footer><a className="wordmark footer-mark" href="#inicio"><span className="mark">J</span><span>LA JOSEFINA<small>LOMITERÍA · CASA DE COMIDAS</small></span></a><span>Hecho con cariño, servido con abundancia.</span><a href="#inicio">VOLVER ARRIBA ↑</a></footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap');
        :root{--ink:#17282b;--muted:#687474;--cream:#f4f0e7;--paper:#fbf9f4;--orange:#c65a35;--line:#e6e0d5}
        *{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:25px}body{margin:0;background:var(--paper);color:var(--ink);font-family:'DM Sans',sans-serif}a{color:inherit;text-decoration:none}
        .hero{min-height:690px;height:min(790px,94vh);background:#1b302e;color:#fbf6eb;position:relative;overflow:hidden;padding:0 7.2%;display:flex;flex-direction:column}.hero:before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 78% 48%,rgba(195,111,69,.36),transparent 33%),radial-gradient(ellipse at 72% 85%,rgba(179,128,75,.2),transparent 37%),linear-gradient(115deg,#172927 15%,#213a36 65%,#35413a);}.hero:after{content:"";position:absolute;width:570px;height:570px;border:1px solid rgba(245,233,207,.13);border-radius:50%;right:6%;top:16%;box-shadow:0 0 0 28px rgba(245,233,207,.025),0 0 0 85px rgba(245,233,207,.025)}.hero-glow{position:absolute;width:440px;height:600px;right:11%;top:15%;opacity:.26;background:radial-gradient(ellipse,#e3a05c 0%,#b6673a 34%,transparent 68%);filter:blur(30px)}
        .topbar,.hero-content,.hero-bottom{position:relative;z-index:2}.topbar{height:100px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(247,240,222,.17)}.wordmark{display:flex;gap:11px;align-items:center;font-weight:700;font-size:14px;letter-spacing:1.6px}.wordmark small{display:block;font-size:8px;letter-spacing:2px;margin-top:4px;color:#c8c4b6;font-weight:500}.mark{width:38px;height:38px;border:1px solid #d6aa76;border-radius:50%;display:grid;place-items:center;font:italic 25px 'Playfair Display';color:#e6bb82}.nav-cta{font-size:12px;border:1px solid rgba(255,255,255,.35);padding:12px 17px;border-radius:3px}.nav-cta span{margin-left:12px;color:#e5aa6f}.hero-content{margin:auto 0;max-width:640px;padding-bottom:18px}.hero-kicker,.eyebrow{font-size:9px;font-weight:700;letter-spacing:2px}.hero-kicker{color:#d9a36c;display:flex;align-items:center;gap:9px}.hero-kicker i{width:6px;height:6px;background:#d9a36c;border-radius:50%}.hero h1{font:500 clamp(58px,8vw,106px)/.99 'Playfair Display',serif;letter-spacing:-3px;margin:27px 0 24px}.hero h1 em{color:#e6ad73;font-weight:500}.hero-content>p{font-size:15px;line-height:1.8;color:#d2d5c9;max-width:380px;margin:0 0 29px}.primary-link{display:inline-flex;align-items:center;gap:27px;background:#d27648;color:#fff9ed;padding:15px 19px;font-weight:700;font-size:12px;border-radius:2px}.primary-link span{font-size:17px}.hero-stamp{position:absolute;left:min(530px,80vw);top:46%;width:116px;height:116px;border:1px solid rgba(247,229,195,.62);border-radius:50%;transform:rotate(12deg);display:grid;place-items:center;text-align:center;color:#eac28d;font-size:9px;letter-spacing:2px;line-height:1.6}.hero-stamp b{font-size:17px;position:absolute;bottom:12px}.hero-bottom{padding:17px 0 21px;border-top:1px solid rgba(247,240,222,.17);display:flex;justify-content:space-between;color:#c5c9bd;font-size:8px;letter-spacing:1.8px}.hero-bottom b{color:#e6ad73;margin-left:9px;font-size:14px}
        .menu-wrap{max-width:1180px;margin:0 auto;padding:104px 38px 85px}.menu-intro{display:flex;justify-content:space-between;align-items:end;margin-bottom:34px}.eyebrow{color:var(--orange)}.menu-intro h2{font:600 clamp(44px,6vw,66px)/1.05 'Playfair Display',serif;letter-spacing:-1.8px;margin:13px 0 0}.menu-intro h2 span{color:var(--orange)}.menu-intro>p{color:var(--muted);max-width:260px;font-size:13px;line-height:1.8;margin-bottom:4px}.category-nav{display:flex;flex-wrap:wrap;gap:9px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:17px 0;margin-bottom:35px}.category-nav a{padding:9px 12px;background:#f1ede4;border-radius:2px;font-size:10px;font-weight:600}.category-nav a span{color:var(--orange);margin-left:12px}.menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px}.menu-card{background:#fffefa;border:1px solid var(--line);padding:25px 28px 26px;position:relative;scroll-margin-top:20px}.menu-card:before{content:"";position:absolute;left:-1px;top:25px;height:27px;width:2px;background:var(--orange)}.card-heading{margin-bottom:17px}.card-heading .eyebrow{font-size:8px}.card-heading h2{font:600 31px/1.15 'Playfair Display',serif;letter-spacing:-.5px;margin:6px 0 5px}.card-heading p{font-size:11px;color:var(--muted);margin:0;line-height:1.5}.dish{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid #eeeae2;padding:12px 0}.dish-copy{display:flex;flex-direction:column;gap:4px;min-width:0}.dish-copy strong{font-size:12px;font-weight:700}.dish-copy span{font-size:10px;line-height:1.5;color:var(--muted);max-width:340px}.price{flex-shrink:0;color:var(--orange);font-size:12px;font-weight:700;white-space:nowrap}.empanada-prices{display:flex;gap:8px;margin-top:9px;flex-wrap:wrap}.empanada-prices div{flex:1;min-width:92px;display:flex;flex-direction:column;gap:6px;background:#f3efe7;padding:11px 12px}.empanada-prices span{font-size:9px;color:var(--muted)}.empanada-prices strong{font-size:12px;color:var(--orange)}.menu-footnote{display:flex;gap:13px;align-items:center;margin:25px 0 0;color:var(--muted);font-size:10px}.menu-footnote span{font-size:22px;color:var(--orange)}footer{border-top:1px solid var(--line);padding:27px 7.2%;display:flex;align-items:center;justify-content:space-between;gap:15px}footer>span{font-size:10px;color:var(--muted)}footer>a:last-child{font-size:8px;letter-spacing:1.4px;font-weight:700;color:var(--orange)}.footer-mark{font-size:12px}.footer-mark .mark{width:32px;height:32px;color:var(--orange);border-color:#d9b693}
        @media(max-width:700px){.hero{height:740px;min-height:650px;max-height:92svh;padding:0 23px}.hero:after{right:-55%;top:22%;width:480px;height:480px}.hero-glow{right:-26%;top:23%}.topbar{height:76px}.wordmark{font-size:11px}.wordmark small{font-size:7px}.mark{width:34px;height:34px}.nav-cta{padding:10px 12px;font-size:10px}.hero-content{margin: auto 0;}.hero h1{font-size:clamp(58px,14vw,83px);letter-spacing:-2.5px;margin:24px 0 19px}.hero-content>p{font-size:13px;max-width:290px}.hero-stamp{left:auto;right:1px;top:69%;width:83px;height:83px;font-size:7px}.hero-stamp b{bottom:6px;font-size:12px}.hero-bottom{font-size:7px;letter-spacing:1px}.menu-wrap{padding:70px 19px 56px}.menu-intro{display:block;margin-bottom:23px}.menu-intro>p{margin:12px 0 0;font-size:12px}.category-nav{flex-wrap:nowrap;overflow-x:auto;white-space:nowrap;margin-right:-19px;padding-right:19px;scrollbar-width:none}.category-nav::-webkit-scrollbar{display:none}.menu-grid{grid-template-columns:1fr;gap:12px}.menu-card{padding:22px 21px}.card-heading h2{font-size:29px}footer{padding:22px 19px;flex-wrap:wrap}footer>span{order:3;width:100%}}
        @media(min-width:1000px){.menu-card-tall{grid-row:span 1}.menu-grid .menu-card:nth-child(4){grid-row:span 2}.menu-grid .menu-card:nth-child(6){grid-column:span 2}.menu-grid .menu-card:nth-child(10){grid-column:span 2}.menu-grid .menu-card:nth-child(10) .dish-list{display:grid;grid-template-columns:1fr 1fr;column-gap:28px}}
      `}</style>
    </main>
  );
}
