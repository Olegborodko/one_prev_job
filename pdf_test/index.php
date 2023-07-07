<?php

// require('fpdf184/fpdf.php');

// $pdf= new FPDF();
// $pdf->SetAuthor('Lana Kovacevic');
// $pdf->SetTitle('FPDF tutorial');
// $pdf->SetFont('Helvetica','B',20);
// $pdf->SetTextColor(50,60,100);
// $pdf->AddPage('P');
// $pdf->SetDisplayMode('real','default');
// $rawtext = '<p dir="ltr" style="text-align: right;">one comment<br>(1)</p>';
// // $pdf->writeHTMLCell(100, 0, 100, 100, $rawtext, 0, 0, false, true, 'C');

// $pdf->Output('example1.pdf','I');

require('tcpdf/tcpdf.php');
$pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
$pdf->AddPage();

$pdf->SetXY(50, 50);

$rawtext = '<p dir="ltr" style="text-align: left;">two comment<br></p>(2)';
// $pdf->writeHTMLCell(100, 0, 100, 100, $rawtext, 0, 0, false, true, 'C');

$textresult = '<p dir="ltr" style="text-align: left;">' . $rawtext . '</p>';
// Add the label.
// $this->writeHTMLCell($width, 0, $x, $y, $rawtext, 0, 0, false, true, 'C');

// $pdf->SetAlpha(0.1);
// $pdf->SetFillColor(255, 255, 200);

// $pdf->SetStrokeOpacity(0.5);

// $pdf->SetAlpha(1);

$pdf->setCellPaddings(5, 5, 5, 5);
$pdf->writeHTMLCell(50, 0, 1, 30, $textresult, array(
    'LRTB' => array(
        'width' => 0.5,
        'color' => array(0, 0, 200)
    )
), 0, 0, true, 'J');
$pdf->lastPage();

// $pdf->MultiCell(0, 0, $rawtext, 0, 'L');

$prop = array();
$opt = array();
// $pdf->Cell(0, 12, 'Hello 1', 1, 1, 'C');

// $pdf->writeHTML($rawtext, true, 0, true, 0);

// $pdf->Write(0, 'Example of text layout using Multicell()', '', 0, 'L', true, 0, false, false, 0);

// $pdf->Cell(0, 0, 'Bottom-Bottom', 0, 0, 'C', 0, '', 0, false, 'B', 'B');

// $pdf->writeHTML($rawtext, true, false, false, false, '');

$pdf->Output('example_1.pdf', 'I');
