import { Food } from "@/domain/models/food";
import { jsPDF } from "jspdf";

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No se pudo crear contexto 2D");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = url;
  });
};

const centeredText = (
  doc: jsPDF,
  text: string,
  y: number,
  fontSize = 12,
  color?: [number, number, number]
) => {
  if (color) {
    doc.setTextColor(...color); // usa el color si viene definido
  } else {
    doc.setTextColor(0, 0, 0); // si no, negro por defecto
  }

  doc.setFontSize(fontSize);
  const textWidth = doc.getTextWidth(text);
  const pageWidth = doc.internal.pageSize.getWidth();
  const x = (pageWidth - textWidth) / 2;
  doc.text(text, x, y);

  // Opcional: resetear a negro para que no afecte textos posteriores
  doc.setTextColor(0, 0, 0);
};

export const generatePdf = async (
  paginatedFoods: Food[],
  selectedFoods: number[]
) => {
  const doc = new jsPDF();

  // Filtrar solo los alimentos seleccionados
  const selectedItems = paginatedFoods.filter((food) =>
    selectedFoods.includes(food.id)
  );

  // Agrupar por categoría
  const groupedByCategory = selectedItems.reduce<Record<string, Food[]>>(
    (acc, food) => {
      if (!acc[food.category]) acc[food.category] = [];
      acc[food.category].push(food);
      return acc;
    },
    {}
  );

  const pageHeight = doc.internal.pageSize.getHeight();
  const halfPageHeight = pageHeight / 2;

  let isFirstPage = true;

  for (const category of Object.keys(groupedByCategory)) {
    const foodsInCategory = groupedByCategory[category];

    // Si no es la primera categoría, agregar página antes de iniciar nueva categoría
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    // Título de la categoría al inicio de la página
    centeredText(doc, `Categoría: ${category}`, 10, 16, [0, 102, 204]);

    // Contador de alimentos en la página (de 0 a 1) para saltar de mitad en mitad
    let itemsOnPage = 0;

    for (let i = 0; i < foodsInCategory.length; i++) {
      const food = foodsInCategory[i];

      // Saltar página si ya hay 2 alimentos impresos en la página y no es el primero alimento de la categoría
      if (itemsOnPage === 2) {
        doc.addPage();
        // Reimprimir el título de la categoría en la nueva página
        centeredText(doc, `Categoría: ${category}`, 10, 16, [0, 102, 204]);
        itemsOnPage = 0;
      }

      const isTopHalf = itemsOnPage === 0;
      // El contenido empieza después del título de la categoría (pos y=10 + espacio)
      let y = isTopHalf ? 20 : halfPageHeight + 10;

      // --- Código para imprimir el alimento (igual que antes) ---
      centeredText(doc, `${food.name}`, y, 14);
      y += 8;


      if (food.imageUrl) {
        try {
          const imageUrl = `https://pub-b150312a074447b28b7b2fe8fac4e6f5.r2.dev/${food.imageUrl}`;
          const base64Image = await loadImageAsBase64(imageUrl);

          const img = new Image();
          img.src = base64Image;

          await new Promise((resolve) => {
            img.onload = () => resolve(true);
          });

          const maxWidth = 50;
          const maxHeight = 50;
          const ratio = img.width / img.height;

          let imgWidth = maxWidth;
          let imgHeight = maxWidth / ratio;

          if (imgHeight > maxHeight) {
            imgHeight = maxHeight;
            imgWidth = maxHeight * ratio;
          }

          const xCentered = (doc.internal.pageSize.getWidth() - imgWidth) / 2;

          doc.addImage(base64Image, "PNG", xCentered, y, imgWidth, imgHeight);
          y += imgHeight + 10;
        } catch (error) {
          console.log(error);
          doc.text("Error al cargar la imagen", 14, y);
          y += 10;
        }
      } else {
        y += 10;
      }

      if (food.nutritionDetails.length > 0) {
        centeredText(doc, "Informe Nutricional:", y, 15);
        y += 6;

        let x = 14;
        const spacing = 70;
        const fontSize = 10;

        food.nutritionDetails.forEach((n) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(fontSize);

          const text = `• ${n.nutrient}:`;
          doc.text(text, x, y);

          const textWidth = doc.getTextWidth(text);

          doc.setFont("helvetica", "normal");
          doc.text(`${n.value} ${n.unit}`, x + textWidth + 2, y);

          x += spacing;

          if (x > doc.internal.pageSize.getWidth() - 50) {
            x = 14;
            y += 6;
          }
        });

        y += 10;
      } else {
        centeredText(doc, "No hay detalles nutricionales disponibles.", y, 10);
        y += 6;
      }

      if (food.householdMeasures.length > 0) {
        centeredText(doc, "Medidas Caseras", y, 12);
        y += 6;

        food.householdMeasures.forEach((m) => {
          const line = `• ${m.description} → ${m.quantity} unidades, ${m.weightGrams}g`;
          centeredText(doc, line, y, 10);
          y += 5;
        });
      } else {
        centeredText(doc, "No hay medidas caseras disponibles.", y, 10);
        y += 6;
      }

      itemsOnPage++;
    }
  }

  doc.save("alimentos.pdf");
};
