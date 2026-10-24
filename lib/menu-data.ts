export type MenuSection = {
  id: string;
  title: string;
  note: string;
  items: [string, string, string][];
  extras?: [string, string][];
};

export const menu: MenuSection[] = [
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

