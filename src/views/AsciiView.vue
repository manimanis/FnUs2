<template>
  <div class="ascii-container">
    <div class="ascii-header">
      <h2>Table ASCII</h2>
      <p class="subtitle">Code ASCII (0–127) — survolez une case pour voir la description</p>
      <div class="nav-actions">
        <router-link to="/" class="btn btn-secondary">← Retour à l'éditeur</router-link>
      </div>
    </div>

    <div class="ascii-grid-wrapper">
      <table class="ascii-grid">
        <thead>
          <tr>
            <th></th>
            <th v-for="col in 16" :key="'h' + col" class="col-header">x{{ (col - 1).toString(16).toUpperCase() }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in 8" :key="'r' + row">
            <td class="row-header">{{ ((row - 1).toString(16).toUpperCase()) }}x</td>
            <td v-for="col in 16" :key="'c' + row + '-' + col" class="ascii-cell"
              :class="cellClass(gridData[row - 1][col - 1].code)" :title="gridData[row - 1][col - 1].desc">
              <span class="cell-code">{{ gridData[row - 1][col - 1].code }}</span>
              <span class="cell-char">{{ gridData[row - 1][col - 1].char }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const descriptions = {
  0: 'NUL (Null)', 1: 'SOH (Start of Heading)', 2: 'STX (Start of Text)', 3: 'ETX (End of Text)',
  4: 'EOT (End of Transmission)', 5: 'ENQ (Enquiry)', 6: 'ACK (Acknowledgment)', 7: 'BEL (Bell)',
  8: 'BS (Backspace)', 9: 'HT (Horizontal Tab)', 10: 'LF (Line Feed)', 11: 'VT (Vertical Tab)',
  12: 'FF (Form Feed)', 13: 'CR (Carriage Return)', 14: 'SO (Shift Out)', 15: 'SI (Shift In)',
  16: 'DLE (Data Link Escape)', 17: 'DC1 (Device Control 1)', 18: 'DC2 (Device Control 2)', 19: 'DC3 (Device Control 3)',
  20: 'DC4 (Device Control 4)', 21: 'NAK (Negative Acknowledgment)', 22: 'SYN (Synchronous Idle)', 23: 'ETB (End of Transmission Block)',
  24: 'CAN (Cancel)', 25: 'EM (End of Medium)', 26: 'SUB (Substitute)', 27: 'ESC (Escape)',
  28: 'FS (File Separator)', 29: 'GS (Group Separator)', 30: 'RS (Record Separator)', 31: 'US (Unit Separator)',
  32: 'SP (Space)', 127: 'DEL (Delete)'
};

function cellChar(code) {
  const sc = ["NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL", "BS", "TAB", "LF", "VT", "FF", "CR", "SO", "SI", "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US"];
  if (code < 32) return sc[code];
  if (code === 32) return '␣';
  if (code === 127) return '␡';
  return String.fromCharCode(code);
}

function cellDesc(code) {
  return descriptions[code] || (code >= 32 && code < 127 ? `Caractère ${String.fromCharCode(code)}` : '');
}

function cellClass(code) {
  if (code < 32) return 'control';
  if (code === 127) return 'del';
  return 'printable';
}

const gridData = [];
for (let row = 0; row < 8; row++) {
  const cols = [];
  for (let col = 0; col < 16; col++) {
    const code = row * 16 + col;
    cols.push({ code, char: cellChar(code), desc: cellDesc(code) });
  }
  gridData.push(cols);
}
</script>

<style scoped>
.ascii-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  overflow: auto;
}

.ascii-header {
  margin-bottom: 20px;
}

.ascii-header h2 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
}

.ascii-header .subtitle {
  margin: 0 0 12px 0;
  color: var(--text-secondary, #999);
  font-size: 0.85rem;
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.ascii-grid-wrapper {
  width: 952px;
  border-radius: 8px;
  border: 1px solid var(--border, #333);
}

.ascii-grid {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
}

.ascii-grid th,
.ascii-grid td {
  border: 1px solid var(--border, #333);
  padding: 6px 3px;
  text-align: center;
}

.ascii-grid th {
  background: rgba(124, 77, 255, 0.15);
  color: var(--accent, #7c4dff);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.row-header,
.col-header {
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--accent, #7c4dff);
  width: 32px;
  min-width: 32px;
}

.ascii-cell {
  cursor: default;
  transition: background 0.15s;
  min-width: 52px;
}

.ascii-cell:hover {
  background: rgba(124, 77, 255, 0.2) !important;
}

.ascii-cell.control {
  color: var(--text-secondary, #888);
}

.ascii-cell.printable {
  color: var(--text, #e0e0e0);
}

.ascii-cell.del {
  color: #e53935;
}

.cell-code {
  display: block;
  font-size: 0.75rem;
  opacity: 0.7;
  line-height: 1.3;
}

.cell-char {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
}

.ascii-cell.control .cell-char {
  font-size: 0.7rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--border, #333);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  background: transparent;
  color: var(--text, #e0e0e0);
  font-family: inherit;
}

.btn-secondary {
  border-color: var(--border, #333);
}

.btn-secondary:hover {
  border-color: var(--accent, #7c4dff);
  color: var(--accent, #7c4dff);
  background: rgba(124, 77, 255, 0.1);
}
</style>