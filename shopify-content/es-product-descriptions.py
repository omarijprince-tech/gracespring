"""Spanish product descriptions and SEO for Blue Star (registered with translationsRegister, locale es).

Run `python3 shopify-content/es-product-descriptions.py` to print the JSON that the registration step uses.
Digests come from translatableResources(resourceType: PRODUCT); re-fetch them if the English text changes.
"""
import json

WHY_WATER = """<p><strong>¿Por qué es importante tomar agua?</strong></p>
<p>Hablemos de por qué tomar agua es tan importante. Piénsalo como el <strong>combustible de tu cuerpo</strong>: mantiene todo funcionando bien. Desde ayudarte a pensar con claridad hasta mantener tu <strong>piel radiante</strong>, el agua lo hace todo.</p>
<p>Además, mantenerte hidratado puede <strong>darte más energía</strong> y hasta ayudar a la digestión. Así que la próxima vez que te sientas sin ánimo, sírvete un vaso de agua Blue Star y dale a tu cuerpo la hidratación que necesita. ¡Tu yo del <strong>futuro</strong> te lo agradecerá! Y por suerte tienes el mejor servicio de agua a domicilio de NJ para llevártela hasta tu puerta.</p>
<p>Tomar agua todos los días es como darle a tu cuerpo un gran abrazo refrescante. Estas son algunas razones:</p>
<ol>
<li><p><strong>Hidratación:</strong> el agua es esencial para mantener tu cuerpo hidratado y ayuda en todo, desde la digestión hasta la circulación.</p></li>
<li><p><strong>Más energía:</strong> mantenerte hidratado te da energía al instante y te ayuda a sentirte más alerta y concentrado durante el día.</p></li>
<li><p><strong>Piel sana:</strong> la hidratación es clave para una piel sana y radiante. Tomar agua ayuda a mantener tu cutis limpio e hidratado.</p></li>
<li><p><strong>Desintoxicación:</strong> el agua ayuda a eliminar toxinas y apoya a tu hígado y tus riñones en ese proceso.</p></li>
<li><p><strong>Control de peso:</strong> tomar agua antes de comer te ayuda a sentirte lleno, así es menos probable que comas de más.</p></li>
<li><p><strong>Mejor ánimo:</strong> la deshidratación te puede dejar cansado y de mal humor; mantenerte hidratado ayuda a que tu ánimo se mantenga estable y en alto.</p></li>
</ol>
<p>¡Así que salud! Tu cuerpo te agradecerá estar hidratado y sentirte bien todos los días.</p>
<p><strong>¿Cuánta agua debo tomar?</strong></p>
<p>¡La pregunta de siempre! La regla general es unos 8 vasos al día, pero la verdad es que <strong>varía para cada persona</strong>. Tu edad, tu peso, tu nivel de actividad y hasta el clima influyen en cuánta agua necesitas.</p>
<p>La clave es escuchar a tu cuerpo: si tienes sed, <strong>¡toma agua!</strong> Y no olvides que las <strong>frutas y verduras</strong> también son una gran fuente de <strong>hidratación</strong>. Ve tomando agua durante el día y estarás perfecto.</p>
<p><strong>Dato:</strong> muchas frutas y verduras están llenas de <strong>agua que te mantiene hidratado</strong>. Piensa en la sandía jugosa, el pepino fresco, el apio, las fresas y los pimientos. Hasta las naranjas, los tomates, la lechuga y el calabacín tienen un <strong>alto contenido de agua</strong>. ¡Es como hidratarte con cada bocado! Así que llénate de estos alimentos y mantente fresco y con energía.</p>
<p>Si llegaste hasta aquí, te tomas muy en serio tu hidratación. La mejor agua es la que se entrega con cariño.</p>"""

REFILL_HOW = """<p>Si ya tienes una botella vacía, te la cambiamos. Recogemos tus botellas vacías cuando termines y las reemplazamos por botellas limpias con la mejor agua de Nueva Jersey y Nueva York. Si se te complica, llámanos y en 5 minutos dejamos tu pedido listo y programado: <strong>973-742-0435</strong>.</p>
<p>Por ahora aceptamos botellas de 5 galones de Blue Star, Poland Spring, Nestlé Pure Life, Diamond Rock, Primo y Ozarka. Si tienes alguna de estas botellas, agrega a tu carrito los productos de <strong>refill</strong>.</p>
<p>Si no tienes una botella de 5 galones, agrega a tu carrito las botellas <strong>nuevas</strong>.</p>"""

PURIFIED_INTRO = """<p>Esta agua es <strong>perfecta</strong> para quienes simplemente quieren <strong>tomar más agua</strong>. Es como un nuevo comienzo para tu cuerpo: te mantiene hidratado y te ayuda a <strong>sentirte mejor</strong>. Somos el mejor servicio de agua a domicilio de Nueva Jersey, y puedes confiar en que cada gota es pura.</p>
<p>Si estás empezando y también necesitas un <strong>dispensador de agua</strong>, tenemos paquetes con dispensadores excelentes. Te invitamos a ver nuestra <strong>oferta de dispensador con 5 botellas de agua purificada gratis</strong>: la encuentras <strong><a href="https://bluestarpurewater.com/products/refurbished-water-dispenser-5-bottles-free">aquí</a></strong>.</p>"""

ALKALINE_BODY = """<p>El agua alcalina es como la <strong>superheroína de la hidratación</strong>. Es agua con un <strong>pH más alto que el agua común</strong>, lo que la hace menos ácida y más… bueno, ¡alcalina! Hay quienes dicen que les ayuda con la digestión, la energía y hasta la salud de la piel.</p>
<p>Es como darle a tu cuerpo un abrazo <strong>refrescante</strong> que equilibra el pH desde adentro. Si quieres darle un toque extra a tu hidratación, el agua alcalina puede ser tu nueva aliada.</p>
<p>Aunque los investigadores siguen estudiándola, algunas personas creen que tomar agua alcalina puede ofrecer varios beneficios:</p>
<ol>
<li><p><strong>Mejor hidratación:</strong> se cree que el cuerpo la absorbe más rápido, lo que ayudaría a hidratarte mejor.</p></li>
<li><p><strong>Equilibrio del pH:</strong> hay quienes sugieren que ayuda a neutralizar la acidez del cuerpo y a reducir el reflujo u otras molestias digestivas.</p></li>
<li><p><strong>Mejor digestión:</strong> algunas personas sienten que calma el estómago y ayuda a digerir mejor los alimentos.</p></li>
<li><p><strong>Más energía:</strong> por su contenido de minerales y su poder hidratante, puede darte energía extra durante el día.</p></li>
<li><p><strong>Piel sana:</strong> la hidratación es clave para una piel sana y radiante.</p></li>
</ol>
<p>Recuerda que cada cuerpo es diferente y lo que funciona para una persona puede no funcionar para otra. Como siempre, <strong>escucha a tu cuerpo y consulta a un profesional de la salud</strong> si tienes dudas sobre incluir agua alcalina en tu rutina.</p>
<p>Te llevamos el agua alcalina <strong>Alkaid</strong> <strong>directo a tu puerta</strong>, para tu casa o tu oficina, con el mejor servicio de agua a domicilio de NJ.</p>
<p>Si quieres probar los posibles beneficios del agua alcalina, <strong>Blue Star Pure Water</strong> te lo pone fácil: te llevamos agua alcalina fresca a tu puerta en Nueva Jersey. Mira nuestra agua alcalina <strong><a href="https://bluestarpurewater.com/products/new-alkaid-alkaline-water">aquí</a></strong>. ¡Tu camino a una mejor hidratación empieza aquí!</p>"""

SPRING_BODY = """<p>Nuestra agua de manantial viene de hermosos <strong>manantiales naturales en Pensilvania</strong>. Es un regalo de la naturaleza. Y no es solo agua: está llena de minerales como calcio, hierro, magnesio y sulfato, que recoge al fluir entre las rocas. Cada sorbo es como un pequeño <strong>abrazo de la madre naturaleza</strong>.</p>
<p>El <strong>agua de manantial</strong> es pura, no la toca la mano del hombre, y tiene un sabor fresco y natural que viene directo de la tierra.</p>
<p>Imagina meter los pies en un manantial fresco en un día de verano: esa es la sensación que el agua de manantial lleva a tu vaso. Con su sabor limpio y sus minerales naturales, es un pedacito de paraíso en cada sorbo.</p>
<p>Ya sea para quitarte la sed después de hacer ejercicio o para relajarte un momento, el agua de manantial te mantiene <strong>fresco y con energía</strong>.</p>
<p>En <strong>Blue Star</strong> nos enorgullece <strong>llevar</strong> esta agua de manantial natural <strong>directo a tu puerta</strong>, para que disfrutes sus beneficios de forma <strong>cómoda</strong> y confiable.</p>
<p>Piensa en el agua de manantial como un elixir natural de la tierra. Estos son sus beneficios:</p>
<ol>
<li><p><strong>Frescura pura:</strong> no la toca la mano del hombre, así que recibes el agua en su forma más pura.</p></li>
<li><p><strong>Minerales naturales:</strong> suele contener minerales esenciales como calcio, magnesio y potasio, muy buenos para tu salud.</p></li>
<li><p><strong>Hidratación:</strong> su sabor limpio y fresco la hace ideal para mantenerte hidratado todo el día.</p></li>
<li><p><strong>Salud digestiva:</strong> algunas personas sienten que sus minerales ayudan a la digestión y calman el estómago.</p></li>
<li><p><strong>Piel radiante:</strong> la hidratación es clave para una piel sana, y el agua de manantial ayuda a que tu cutis luzca mejor.</p></li>
</ol>
<p>¿Quieres probar el agua de manantial? Somos el <strong>mejor servicio de agua a domicilio de NJ</strong> y la llevamos a tu casa u oficina al día siguiente de tu pedido.</p>
<p>¿Preguntas? Llámanos al <strong>973-742-0435</strong></p>"""


def stand(n):
    return (f"<p><strong>Estante para botellas de agua de 5 galones:</strong> estructura de acero resistente para {n} botellas, "
            "de diseño sencillo pero firme.</p>"
            "<p><strong>Organiza tu espacio:</strong> ocupa poco lugar y mantiene tus botellas en orden, sin estorbar en el piso. "
            "Sus patas de goma ajustables mantienen el estante estable y no rayan el piso.</p>"
            "<p><strong>Úsalo donde quieras:</strong> es liviano y compacto, fácil de mover; ideal para la oficina, la casa, "
            "la cocina, la despensa y hasta el garaje.</p>"
            "<p><strong>Instalación flexible:</strong> se puede armar de 2 formas; ajusta la posición de las botellas hacia "
            "arriba o hacia abajo girando el marco que las sostiene.</p>")


ES = {
    "6688699089076": {  # Purified Water - Re-Fill
        "body_html": """<p>¿Ya tienes botellas vacías de 5 galones? <strong>¡PERFECTO!</strong> Con gusto nos llevamos tus botellas vacías y te las cambiamos por la mejor agua de Nueva Jersey. Somos el mejor servicio de agua a domicilio de NJ y estamos aquí para TI.</p>
""" + PURIFIED_INTRO + "\n" + REFILL_HOW + "\n" + WHY_WATER,
        "meta_title": "Refill de agua purificada 5 galones a domicilio NJ y NY | Blue Star",
        "meta_description": "Refill de tu botella de 5 galones con agua purificada Blue Star, a domicilio para casas y oficinas en Nueva Jersey y Nueva York. Cambiamos tu botella vacía.",
    },
    "6688699547828": {  # Spring Water - Re-Fill
        "body_html": SPRING_BODY,
        "meta_title": "Refill de agua de manantial Grace Spring 5 galones | Blue Star NJ",
        "meta_description": "Refill de tu botella de 5 galones con agua de manantial 100% natural Grace Spring, a domicilio por Blue Star para casas y oficinas en NJ y NY.",
    },
    "6688700432564": {  # Alkaline Water - Re-Fill
        "body_html": "<p>Recogemos tus botellas vacías de agua alcalina y te las cambiamos por botellas nuevas y frescas.</p>\n" + ALKALINE_BODY,
        "meta_title": "Refill de agua alcalina ALKAID 5 galones a domicilio | Blue Star",
        "meta_description": "Refill de tu botella de 5 galones con agua alcalina ALKAID de Blue Star, a domicilio para casas y oficinas en NJ y NY. Cambiamos tu botella vacía.",
    },
    "6753494040756": {  # Purified Water - New Bottle
        "body_html": PURIFIED_INTRO + "\n" + REFILL_HOW + "\n" + WHY_WATER,
        "product_type": "agua",
        "meta_title": "Agua purificada 5 galones, botella nueva | Blue Star NJ y NY",
        "meta_description": "Botella nueva de 5 galones libre de BPA con agua purificada Blue Star. Clientes nuevos: entregamos a casas y oficinas en Nueva Jersey y Nueva York.",
    },
    "6753521369268": {  # Alkaline Water - New Bottle
        "body_html": ALKALINE_BODY,
        "meta_title": "Agua alcalina ALKAID 5 galones, botella nueva | Blue Star NJ",
        "meta_description": "Botella nueva de 5 galones libre de BPA con agua alcalina ALKAID de Blue Star. Entrega a casas y oficinas en NJ y NY. Hablamos español.",
    },
    "6753522614452": {  # Spring Water - New Bottle
        "body_html": SPRING_BODY,
        "meta_title": "Agua de manantial Grace Spring 5 galones, botella nueva | Blue Star",
        "meta_description": "Botella nueva de 5 galones libre de BPA con agua de manantial 100% natural Grace Spring. Entrega a domicilio por Blue Star en NJ y NY.",
    },
    "7121119445172": {  # White top-load cooler
        "body_html": """<p>Este dispensador de agua fría y caliente de carga superior te da agua purificada bien fría o caliente con solo tocar un botón. Disfruta un vaso de agua fresca o prepara tus bebidas frías o calientes, sopas o avena favoritas con facilidad. Su diseño limpio y sencillo combina con casi cualquier espacio de tu casa, y su seguro para niños te da tranquilidad. El área de llenado es amplia y caben la mayoría de vasos y jarras. Usa botellas de 3 a 5 galones, lo que reduce el desperdicio de botellas desechables y filtros, y su certificación Energy Star mantiene bajo el consumo de electricidad.</p>
<ul>
<li>Depósitos de agua fría y caliente de acero inoxidable, duraderos y confiables</li>
<li>Termostato de agua fría ajustable</li>
<li>Área de llenado amplia para la mayoría de vasos y jarras</li>
<li>Collar de soporte antigoteo que evita fugas de la botella</li>
<li>Certificado ETL y ENERGY STAR</li>
</ul>""",
        "meta_description": "Oferta especial: compra un dispensador de agua blanco nuevo y recibe CINCO botellas de agua purificada gratis, entregadas en tu puerta en NJ y NY.",
    },
    "7121124163764": {  # Gray bottom-load cooler
        "body_html": """<p>Este dispensador de agua te da agua purificada bien fría, fresca o muy caliente con solo tocar un botón. Disfruta un vaso de agua fresca o prepara tus bebidas frías o calientes, sopas o avena favoritas con facilidad.</p>
<p>La botella se guarda dentro del gabinete, así que no tienes que levantarla, voltearla ni derramar agua. El indicador de botella vacía te avisa cuando es hora de cambiarla. Sus detalles en negro mate y acero inoxidable combinan con casi cualquier espacio de tu casa. El área de llenado es amplia y caben la mayoría de vasos y jarras. Su seguro para niños y su luz nocturna te dan tranquilidad, y la bandeja de goteo se quita fácilmente para limpiarla. Usa botellas de 3 a 5 galones, lo que reduce el desperdicio de botellas desechables y filtros, y su certificación Energy Star mantiene bajo el consumo de electricidad.</p>
<ul>
<li>Depósitos de agua fría y caliente de acero inoxidable, duraderos y confiables</li>
<li>Luz nocturna LED integrada y bomba de agua silenciosa</li>
<li>Sistema de esterilización UV que cuida la calidad del agua</li>
<li>Área de llenado amplia para la mayoría de vasos y jarras</li>
<li>Certificado ETL y ENERGY STAR</li>
</ul>
<p><strong>1 AÑO DE GARANTÍA</strong></p>""",
        "meta_description": "Oferta especial: compra un dispensador de agua nuevo de carga inferior y recibe CINCO botellas de agua purificada gratis, entregadas en tu puerta en NJ y NY.",
    },
    "7124467056820": {"body_html": stand(8)},
    "7124471840948": {"body_html": stand(5)},
    "7124473774260": {"body_html": stand(4)},
    "7124476035252": {  # Digital pump
        "body_html": """<p>💧 <strong>100% SEGURO PARA TI Y TUS HIJOS:</strong> es un producto libre de BPA que te da agua potable sana, sin preocupaciones.</p>
<p>💧 <strong>OLVÍDATE DEL SABOR A PLÁSTICO:</strong> sabemos que muchos dispensadores dejan sabor a plástico. Este no: su tubo es de acero inoxidable y la manguera es de plástico de alta calidad, para que el agua siempre sepa bien.</p>
<p>💧 <strong>SIRVE PARA BOTELLAS DE 2, 3, 4 Y 5 GALONES:</strong> es una bomba universal que se adapta a casi cualquier botella con cuello de 2.16 pulgadas (5.5 cm). Para que sujete bien el cuello, no presiones la tapa de la botella. Es pequeña, se carga por USB y la puedes usar donde quieras: en casa, en la cocina, en la oficina y hasta de picnic o de campamento. ¡Mucho más fácil que una bomba manual!</p>
<p>💧 <strong>BATERÍA DE LARGA DURACIÓN:</strong> tiene una batería de 1200 mAh. Con una carga completa bombea al menos 30 galones de agua, así que una familia pequeña la carga una vez al mes y una familia grande, dos veces al mes.</p>
<p>💧 <strong>FÁCIL DE USAR CON UN SOLO BOTÓN:</strong> presiona una vez para encenderla y otra vez para apagarla. Por seguridad, se detiene sola después de un minuto. Fácil para todos, incluso para niños y personas mayores.</p>""",
        "meta_description": "Bomba dispensadora de agua digital con un solo botón, recargable por USB, para botellas de 2 a 5 galones. Fácil de usar en casa, la oficina o de viaje.",
    },
    "7202671952052": {  # ALKAID 1L x12
        "body_html": """<p>Te llevamos botellas de agua alcalina a tu puerta para que disfrutes sus posibles beneficios sin complicaciones. Descubre el poder del equilibrio de pH en cada botella de 1 L con nuestro paquete de 12. Con minerales esenciales para tu hidratación y bienestar, mejora tu salud sorbo a sorbo.</p>
<p>El agua alcalina es agua ionizada para elevar su pH, lo que la hace menos ácida y más alcalina. Normalmente se le añaden minerales como calcio, magnesio y potasio. Quienes la recomiendan mencionan posibles beneficios como mejor hidratación, desintoxicación y neutralizar la acidez del cuerpo. Sin embargo, la evidencia científica es limitada y todavía no hay consenso sobre si el agua alcalina ofrece beneficios importantes frente al agua común.</p>""",
        "meta_title": "Agua alcalina ALKAID 12 botellas de 1 L a domicilio | Blue Star NJ",
        "meta_description": "Agua alcalina ALKAID pH 9.5 con electrolitos, paquete de 12 botellas de 1 L. Entrega a domicilio por Blue Star en casas y oficinas de NJ y NY.",
    },
    "9104509370681": {  # MEGA SALE
        "body_html": """<p>¡Atención, Nueva Jersey! Disfruta la máxima comodidad en hidratación con nuestra oferta exclusiva. Llévate un dispensador de agua reacondicionado con 3 meses de garantía, y además recibe 5 garrafones de agua fresca gratis, entregados en tu puerta. Mantente hidratado sin complicaciones y ahorra con esta oferta increíble. ¡No te la pierdas, haz tu pedido hoy!</p>""",
        "product_type": "agua",
        "meta_title": "MEGA OFERTA: Dispensador + 5 botellas + estante GRATIS | Blue Star",
        "meta_description": "Llévate un dispensador de agua fría y caliente con 5 botellas de agua purificada de 5 galones y un estante GRATIS. Entrega en NJ y NY. Hasta agotar existencias.",
    },
}

if __name__ == "__main__":
    print(json.dumps(ES, ensure_ascii=False, indent=1))
