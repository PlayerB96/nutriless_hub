import { Food } from "@/domain/models/food";
import { jsPDF } from "jspdf";

// Función auxiliar para convertir imagen a base64
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Necesario para evitar errores de CORS
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

export const generatePdf = async (
  paginatedFoods: Food[],
  selectedFoods: number[]
) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Listado de Alimentos Seleccionados", 14, 22);

  const selectedItems = paginatedFoods.filter((food) =>
    selectedFoods.includes(food.id)
  );

  for (let index = 0; index < selectedItems.length; index++) {
    const food = selectedItems[index];

    if (index !== 0) doc.addPage();
    let y = index === 0 ? 35 : 20;

    doc.setFontSize(14);
    doc.text(`Alimento: ${food.name}`, 14, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(`Categoría: ${food.category}`, 14, y);
    y += 6;

    doc.text(
      `Fecha de creación: ${new Date(food.createdAt).toLocaleDateString()}`,
      14,
      y
    );
    y += 6;

    if (food.imageUrl) {
      try {
        const imageUrl = `https://pub-b150312a074447b28b7b2fe8fac4e6f5.r2.dev/${food.imageUrl}`;
        console.log(imageUrl);
        const base64Image = await loadImageAsBase64(imageUrl);
        doc.addImage(base64Image, "PNG", 14, y, 50, 50);
        y += 60;
      } catch (error) {
        console.log(error);
        doc.text("Error al cargar la imagen", 14, y);
        y += 10;
      }
    } else {
      y += 10;
    }

    // Sección de detalles nutricionales
    if (food.nutritionDetails.length > 0) {
      doc.setFontSize(12);
      doc.text("Detalles Nutricionales", 14, y);
      y += 6;

      food.nutritionDetails.forEach((n) => {
        doc.setFontSize(10);
        doc.text(`• ${n.nutrient}: ${n.value} ${n.unit}`, 18, y);
        y += 5;
      });
    } else {
      doc.setFontSize(10);
      doc.text("No hay detalles nutricionales disponibles.", 14, y);
      y += 6;
    }

    y += 10;

    // Sección de medidas caseras
    if (food.householdMeasures.length > 0) {
      doc.setFontSize(12);
      doc.text("🥄 Medidas Caseras", 14, y);
      y += 6;

      food.householdMeasures.forEach((m) => {
        doc.setFontSize(10);
        doc.text(
          `• ${m.description} → ${m.quantity} unidades, ${m.weightGrams}g`,
          18,
          y
        );
        y += 5;
      });
    } else {
      doc.setFontSize(10);
      doc.text("No hay medidas caseras disponibles.", 14, y);
      y += 6;
    }
  }

  doc.save("alimentos.pdf");
};
