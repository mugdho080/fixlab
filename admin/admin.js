(function() {
  const loadBtn = document.getElementById('load-btn');
  const addBtn = document.getElementById('add-btn');
  const downloadBtn = document.getElementById('download-btn');
  const tableBody = document.querySelector('#products-table tbody');

  function createRow(product = { id: '', name: '', category: '', device: '', price: '', image: '' }) {
    const tr = document.createElement('tr');
    ['id', 'name', 'category', 'device', 'price', 'image'].forEach(key => {
      const td = document.createElement('td');
      td.contentEditable = 'true';
      td.dataset.field = key;
      td.textContent = product[key] || '';
      tr.appendChild(td);
    });
    const uploadTd = document.createElement('td');
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'btn btn-outline';
    uploadBtn.type = 'button';
    uploadBtn.textContent = 'Upload';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    const preview = document.createElement('img');
    preview.className = 'admin-thumb';
    preview.src = product.image || '';
    if (!preview.src) preview.style.display = 'none';

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const imageCell = tr.querySelector('td[data-field="image"]');
        if (imageCell) imageCell.textContent = dataUrl;
        preview.src = dataUrl;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });

    uploadTd.appendChild(uploadBtn);
    uploadTd.appendChild(fileInput);
    uploadTd.appendChild(preview);
    tr.appendChild(uploadTd);
    const removeTd = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-ghost';
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => tr.remove());
    removeTd.appendChild(removeBtn);
    tr.appendChild(removeTd);
    return tr;
  }

  async function loadProducts() {
    tableBody.innerHTML = '<tr><td colspan="8" class="muted">Loading...</td></tr>';
    try {
      const res = await fetch('../assets/data/products.json');
      if (!res.ok) throw new Error('Network error');
      const items = await res.json();
      tableBody.innerHTML = '';
      items.forEach(item => tableBody.appendChild(createRow(item)));
    } catch (err) {
      tableBody.innerHTML = '<tr><td colspan="8" class="muted">Could not load products.json</td></tr>';
      console.error(err);
    }
  }

  function addProduct() {
    tableBody.appendChild(createRow());
  }

  function downloadJSON() {
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const data = rows.map(row => {
      const obj = {};
      row.querySelectorAll('td[data-field]').forEach(cell => {
        obj[cell.dataset.field] = cell.textContent.trim();
      });
      return obj;
    }).filter(item => item.id || item.name);

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  loadBtn?.addEventListener('click', loadProducts);
  addBtn?.addEventListener('click', addProduct);
  downloadBtn?.addEventListener('click', downloadJSON);
})();
