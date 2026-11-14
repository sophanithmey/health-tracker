'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import jsPDF from 'jspdf';
import { Download, Printer, FileText, Check } from 'lucide-react';
import { HealthReportSummary, PatientProfile, GlucoseRecord, GlucoseTarget } from '@/types';

interface DoctorVisitPdfExportProps {
  summary: HealthReportSummary;
  patient: PatientProfile;
  records: GlucoseRecord[];
  targets: GlucoseTarget[];
}

export function DoctorVisitPdfExport({
  summary,
  patient,
  records,
  targets
}: DoctorVisitPdfExportProps) {
  const t = useTranslations('reports');
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFontSize(18);
      doc.setTextColor(13, 148, 136); // Teal 600
      doc.text('FAMILY DIABETES CARE - CLINICAL VISIT REPORT', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Generated: ${new Date().toLocaleDateString('en-US', {
          timeZone: 'Asia/Phnom_Penh',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })} (Asia/Phnom_Penh)`,
        14,
        26
      );

      // Horizontal line
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 28, 196, 28);

      // Patient Details
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`Patient: ${patient.fullName} (${patient.fullNameKm || ''})`, 14, 36);
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Age: ${patient.age} (${patient.ageGroup}) | Timezone: ${patient.timezone}`, 14, 42);
      doc.text(`Diabetes Classification: ${patient.diabetesType.toUpperCase()} (Configurable)`, 14, 48);
      doc.text(`Prescription: ${patient.currentMedicationsSummary}`, 14, 54);
      doc.text(`Attending Clinician: ${patient.doctorName || 'Not specified'}`, 14, 60);

      // Section: Summary Metrics
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 66, 182, 38, 'F');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`SUMMARY METRICS (Last ${summary.periodDays} Days)`, 18, 73);

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`• Total Measurements Logged: ${summary.totalMeasurements}`, 18, 80);
      doc.text(
        `• Fasting / Pre-meal Glucose Avg: ${summary.fastingAverage ?? '--'} mg/dL (Target: 80-130)`,
        18,
        86
      );
      doc.text(
        `• 2h Post-meal Glucose Avg: ${summary.postMealAverage ?? '--'} mg/dL (Target: < 180)`,
        18,
        92
      );
      doc.text(
        `• Lowest / Highest Recorded: ${summary.overallLowest ?? '--'} / ${summary.overallHighest ?? '--'} mg/dL`,
        18,
        98
      );

      // Medication Adherence
      doc.text(
        `• Medication Adherence Rate: ${summary.medicationAdherenceRate}% (${summary.dosesTaken} doses taken)`,
        105,
        80
      );
      doc.text(`• Above Target Events: ${summary.aboveTargetCount}`, 105, 86);
      doc.text(`• Low Glucose Events (<70): ${summary.belowTargetCount}`, 105, 92);
      doc.text(`• In-Target Percentage: ${summary.inTargetPercentage}%`, 105, 98);

      // Recent Readings List
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('RECENT BLOOD SUGAR READINGS', 14, 114);

      let yPos = 122;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Date & Time (Phnom Penh)', 14, yPos);
      doc.text('Context', 65, yPos);
      doc.text('Value', 105, yPos);
      doc.text('Target Status', 130, yPos);
      doc.text('Recorded By', 165, yPos);
      yPos += 4;
      doc.line(14, yPos, 196, yPos);
      yPos += 5;

      doc.setTextColor(15, 23, 42);
      const printRecords = records.slice(0, 12);
      printRecords.forEach((r) => {
        const d = new Date(r.measuredAt);
        const timeStr = d.toLocaleDateString('en-US', {
          timeZone: 'Asia/Phnom_Penh',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        doc.text(timeStr, 14, yPos);
        doc.text(r.measurementType.replace(/_/g, ' '), 65, yPos);
        doc.text(`${r.valueMgDl} mg/dL`, 105, yPos);
        doc.text(r.targetStatus.toUpperCase(), 130, yPos);
        doc.text(r.recordedByName || 'Caregiver', 165, yPos);
        yPos += 6;
      });

      // Disclaimer footer
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 260, 196, 260);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'LEGAL & MEDICAL DISCLAIMER: This document is compiled for family monitoring and clinician review purposes only.',
        14,
        266
      );
      doc.text(
        'This summary does NOT constitute a formal medical diagnosis, therapeutic recommendation, or modification of prescribed doses.',
        14,
        271
      );

      doc.save(`Family_Diabetes_Care_Report_${patient.fullName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handlePrint}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 touch-target no-print"
      >
        <Printer className="w-4 h-4" />
        <span>{t('printReport')}</span>
      </button>

      <button
        onClick={handleDownloadPdf}
        disabled={isExporting}
        className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 touch-target no-print"
      >
        <Download className="w-4 h-4" />
        <span>{isExporting ? 'Generating PDF...' : t('exportPdf')}</span>
      </button>
    </div>
  );
}

