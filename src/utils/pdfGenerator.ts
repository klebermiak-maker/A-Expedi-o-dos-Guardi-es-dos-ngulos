import { jsPDF } from 'jspdf';
import { ISLAND_LEVELS } from '../data/levels';

export interface PerformancePDFData {
  studentName?: string;
  solvedPolygonsByLevel: Record<number, string[]>;
  inspectedVertices: Record<string, boolean>;
  totalStars: number;
  maxStars: number;
}

export function generatePerformancePDF(data: PerformancePDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const studentName = data.studentName?.trim() || 'Guardião Explorador';

  // 1. Header Banner Background (Deep Navy)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Decorative Accent Strip (Emerald & Amber)
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 42, pageWidth * 0.65, 3, 'F');
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(pageWidth * 0.65, 42, pageWidth * 0.35, 3, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('A EXPEDICAO DOS GUARDIÕES DOS ANGULOS', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text('Portfolio Digital de Aprendizagem · BNCC EF04MA18 (4º Ano)', 14, 26);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  const issueDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Emitido em: ${issueDate} · Reino da Geometria`, 14, 34);

  // 2. Student Identification Card
  let curY = 54;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, curY, pageWidth - 28, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Estudante: ${studentName}`, 20, curY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const portalsReactivated = Object.values(data.solvedPolygonsByLevel).filter(
    (arr) => arr.length === 3
  ).length;
  doc.text(
    `Estrelas Conquistadas: ${data.totalStars} de ${data.maxStars}  |  Portais Reativados: ${portalsReactivated} de 5`,
    20,
    curY + 16
  );

  // 3. Competency / BNCC Summary Box
  curY += 28;
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(14, curY, pageWidth - 28, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('Habilidade BNCC Desenvolvida: EF04MA18', 20, curY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87); // emerald-700
  const bnccText =
    'Reconhecer angulos retos e nao retos em figuras poligonais com uso de dobraduras, esquadro e software de geometria 3D interativo.';
  doc.text(doc.splitTextToSize(bnccText, pageWidth - 42), 20, curY + 14);

  // 4. Detailed Angle Identification Performance
  curY += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Desempenho Geral: Angulos Retos vs. Nao Retos', 14, curY);

  // Calculate totals
  let totalRight = 0;
  let identifiedRight = 0;
  let totalNonRight = 0;
  let identifiedNonRight = 0;

  ISLAND_LEVELS.forEach((lvl) => {
    const solvedIds = data.solvedPolygonsByLevel[lvl.id] || [];
    lvl.polygons.forEach((poly) => {
      const isPolySolved = solvedIds.includes(poly.id);
      poly.vertices.forEach((v) => {
        const isIdentified =
          isPolySolved || Boolean(data.inspectedVertices[`${poly.id}-${v.id}`]);
        if (v.isRight) {
          totalRight += 1;
          if (isIdentified) identifiedRight += 1;
        } else {
          totalNonRight += 1;
          if (isIdentified) identifiedNonRight += 1;
        }
      });
    });
  });

  const rightPct = totalRight > 0 ? Math.round((identifiedRight / totalRight) * 100) : 0;
  const nonRightPct =
    totalNonRight > 0 ? Math.round((identifiedNonRight / totalNonRight) * 100) : 0;

  curY += 6;
  // Progress Bar 1: Angulos Retos (90°)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text(`Angulos Retos (90°): ${identifiedRight} de ${totalRight} identificados (${rightPct}%)`, 14, curY);

  curY += 3;
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(14, curY, pageWidth - 28, 4, 2, 2, 'F');
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(14, curY, ((pageWidth - 28) * rightPct) / 100, 4, 2, 2, 'F');

  curY += 9;
  // Progress Bar 2: Angulos Nao Retos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(2, 132, 199);
  doc.text(
    `Angulos Nao Retos (< 90° e > 90°): ${identifiedNonRight} de ${totalNonRight} identificados (${nonRightPct}%)`,
    14,
    curY
  );

  curY += 3;
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(14, curY, pageWidth - 28, 4, 2, 2, 'F');
  doc.setFillColor(2, 132, 199);
  doc.roundedRect(14, curY, ((pageWidth - 28) * nonRightPct) / 100, 4, 2, 2, 'F');

  // 5. Phase-by-Phase Exploration Breakdown Table
  curY += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Progresso Detalhado pelas 5 Fases do Reino', 14, curY);

  curY += 6;
  // Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, curY, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Fase / Ilha', 18, curY + 4.8);
  doc.text('Foco Geometrico', 60, curY + 4.8);
  doc.text('Desafios', 135, curY + 4.8);
  doc.text('Portal', 165, curY + 4.8);

  curY += 7;
  ISLAND_LEVELS.forEach((lvl, idx) => {
    const solvedList = data.solvedPolygonsByLevel[lvl.id] || [];
    const isRowEven = idx % 2 === 0;

    if (isRowEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(14, curY, pageWidth - 28, 12, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Fase ${lvl.id}: ${lvl.title.replace('Ilha da ', '').replace('Arquipélago dos ', '')}`, 18, curY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const shortFocus = lvl.bnccFocus.split('·')[1]?.trim() || lvl.subtitle;
    doc.text(doc.splitTextToSize(shortFocus, 70)[0] || '', 60, curY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text(`${solvedList.length}/3 ★`, 135, curY + 6);

    const isPortalDone = solvedList.length === 3;
    if (isPortalDone) {
      doc.setTextColor(16, 185, 129); // emerald
      doc.text('REATIVADO', 165, curY + 6);
    } else {
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Em andamento', 165, curY + 6);
    }

    curY += 12;
  });

  // 6. Pedagogical Tools Practiced Checklist
  curY += 4;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(14, curY, pageWidth - 28, 22, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14); // amber-900
  doc.text('Recursos Didaticos Utilizados pelo Aluno:', 19, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('[X] Esquadro Geometrico de 90° em 3D para verificacao de cantos retos', 19, curY + 11.5);
  doc.text('[X] Simulador de Dobradura de Papel para construcao de angulo reto', 19, curY + 16);
  doc.text('[X] Modo de Tracado tatil/mouse e Sonar Direcional de frequencia harmonica', 19, curY + 20.5);

  // 7. Footer Seal & Validation
  const footerY = pageHeight - 12;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Expedicao dos Guardioes dos Angulos · Software Educativo de Geometria 3D', 14, footerY);
  doc.text('Documento comprobatório de proficiência em angulos poligonais', pageWidth - 14, footerY, {
    align: 'right',
  });

  // Download PDF
  const sanitizedStudentName = studentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`relatorio_desempenho_angulos_${sanitizedStudentName}.pdf`);
}
