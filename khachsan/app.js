// Minimal SPA logic + LocalStorage CRUD for demo PMS

// Utility
const $ = (s) => document.querySelector(s)
const $$ = (s) => document.querySelectorAll(s)
const uid = (prefix='ID')=> `${prefix}${Math.random().toString(36).slice(2,9)}`

// Pages
const pages = $$('.page')
const navItems = $$('.nav-item')
navItems.forEach(n=>{
  n.addEventListener('click', ()=>{
    navItems.forEach(x=>x.classList.remove('active'))
    n.classList.add('active')
    showPage(n.dataset.page)
  })
})
function showPage(name){
  pages.forEach(p=>p.classList.add('hide'))
  $('#'+name).classList.remove('hide')
  // refresh data stats
  renderAll()
}

// LocalStorage keys and sample seed
const LS = {
  customers: 'pms_customers',
  rooms: 'pms_rooms',
  bookings: 'pms_bookings',
  services: 'pms_services',
  invoices: 'pms_invoices'
}
function seedIfEmpty(){
  if(!localStorage.getItem(LS.customers)){
    const sampleCustomers = [
      {CustomerID:'C001', Name:'Nguyen Van A', Phone:'0912345678', Email:'a@ex.com', DOB:'1990-01-01'},
      {CustomerID:'C002', Name:'Tran Thi B', Phone:'0987654321', Email:'b@ex.com', DOB:'1992-05-12'}
    ]
    localStorage.setItem(LS.customers, JSON.stringify(sampleCustomers))
  }
  if(!localStorage.getItem(LS.rooms)){
    const sampleRooms = [
      {RoomID:'R101', Type:'Standard', Price:500000, Status:'Trống'},
      {RoomID:'R102', Type:'Deluxe', Price:800000, Status:'Đang thuê'},
      {RoomID:'R201', Type:'Suite', Price:1500000, Status:'Bảo trì'}
    ]
    localStorage.setItem(LS.rooms, JSON.stringify(sampleRooms))
  }
  if(!localStorage.getItem(LS.bookings)){
    const sampleBookings = [
      {BookingID:'B001', CustomerID:'C001', RoomID:'R102', CheckIn:'2025-11-10', CheckOut:'2025-11-12', Status:'Checked-Out'}
    ]
    localStorage.setItem(LS.bookings, JSON.stringify(sampleBookings))
  }
  if(!localStorage.getItem(LS.services)){
    const sampleServices = [
      {ServiceID:'SV1', ServiceName:'Breakfast', Price:80000},
      {ServiceID:'SV2', ServiceName:'Laundry', Price:50000}
    ]
    localStorage.setItem(LS.services, JSON.stringify(sampleServices))
  }
  if(!localStorage.getItem(LS.invoices)){
    const sampleInvoices = [
      {InvoiceID:'I001', BookingID:'B001', Total:900000, Method:'Cash', Date:'2025-11-12'}
    ]
    localStorage.setItem(LS.invoices, JSON.stringify(sampleInvoices))
  }
}
seedIfEmpty()

// Read helpers
const read = (k)=> JSON.parse(localStorage.getItem(k) || '[]')
const write = (k,v)=> localStorage.setItem(k, JSON.stringify(v))

/* ---------- RENDER & CRUD for Customers ---------- */
function renderCustomers(filter=''){
  const tbody = $('#custTableBody'); tbody.innerHTML=''
  const list = read(LS.customers).filter(c=>{
    const q = filter.trim().toLowerCase()
    if(!q) return true
    return (c.Name||'').toLowerCase().includes(q) || (c.Phone||'').includes(q)
  })
  list.forEach(c=>{
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${c.CustomerID}</td>
      <td>${c.Name}</td><td>${c.Phone}</td><td>${c.Email||''}</td><td>${c.DOB||''}</td>
      <td>
        <button class="btn small" data-id="${c.CustomerID}" data-action="edit">Sửa</button>
        <button class="btn small" data-id="${c.CustomerID}" data-action="del">Xóa</button>
      </td>`
    tbody.appendChild(tr)
  })
  // attach events
  tbody.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id=btn.dataset.id, act=btn.dataset.action
      if(act==='edit') openCustomerForm('edit', id)
      if(act==='del'){ if(confirm('Xóa khách hàng?')){ deleteCustomer(id) } }
    })
  })
}
function addCustomer(obj){
  const arr=read(LS.customers); arr.unshift(obj); write(LS.customers, arr); renderCustomers()
}
function updateCustomer(id, payload){
  const arr=read(LS.customers).map(c=> c.CustomerID===id ? {...c, ...payload} : c)
  write(LS.customers, arr); renderCustomers()
}
function deleteCustomer(id){
  const arr=read(LS.customers).filter(c=>c.CustomerID!==id); write(LS.customers,arr); renderCustomers()
}

/* ---------- ROOMS ---------- */
function renderRooms(filter=''){
  const tbody = $('#roomTableBody'); tbody.innerHTML=''
  const list = read(LS.rooms).filter(r=>{
    const q = filter.trim().toLowerCase()
    if(!q) return true
    return (r.RoomID||'').toLowerCase().includes(q) || (r.Type||'').toLowerCase().includes(q)
  })
  list.forEach(r=>{
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${r.RoomID}</td><td>${r.Type}</td><td>${r.Price.toLocaleString()}</td><td>${r.Status}</td>
      <td>
        <button class="btn small" data-id="${r.RoomID}" data-action="edit">Sửa</button>
        <button class="btn small" data-id="${r.RoomID}" data-action="del">Xóa</button>
      </td>`
    tbody.appendChild(tr)
  })
  tbody.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id=btn.dataset.id, act=btn.dataset.action
      if(act==='edit') openRoomForm('edit', id)
      if(act==='del'){ if(confirm('Xóa phòng?')){ deleteRoom(id) } }
    })
  })
}
function addRoom(obj){ const arr=read(LS.rooms); arr.unshift(obj); write(LS.rooms,arr); renderRooms() }
function updateRoom(id,payload){ const arr=read(LS.rooms).map(r=> r.RoomID===id? {...r,...payload}:r); write(LS.rooms,arr); renderRooms() }
function deleteRoom(id){ const arr=read(LS.rooms).filter(r=>r.RoomID!==id); write(LS.rooms,arr); renderRooms() }

/* ---------- BOOKINGS ---------- */
function renderBookings(filter=''){
  const tbody = $('#bookingTableBody'); tbody.innerHTML=''
  const bookings = read(LS.bookings)
  const customers = read(LS.customers)
  const rooms = read(LS.rooms)
  const list = bookings.filter(b=>{
    const q = filter.trim().toLowerCase()
    if(!q) return true
    return b.BookingID.toLowerCase().includes(q) || b.RoomID.toLowerCase().includes(q) || (customers.find(c=>c.CustomerID===b.CustomerID)||{}).Name?.toLowerCase()?.includes(q)
  })
  list.forEach(b=>{
    const cust = read(LS.customers).find(c=>c.CustomerID===b.CustomerID) || {}
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${b.BookingID}</td><td>${cust.Name||b.CustomerID}</td><td>${b.RoomID}</td><td>${b.CheckIn}</td><td>${b.CheckOut||''}</td><td>${b.Status}</td>
      <td>
        <button class="btn small" data-id="${b.BookingID}" data-action="view">View</button>
        <button class="btn small" data-id="${b.BookingID}" data-action="del">Xóa</button>
      </td>`
    tbody.appendChild(tr)
  })
  tbody.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id=btn.dataset.id, act=btn.dataset.action
      if(act==='view') viewBooking(id)
      if(act==='del'){ if(confirm('Xóa booking?')){ deleteBooking(id) } }
    })
  })
}
function addBooking(obj){ const arr=read(LS.bookings); arr.unshift(obj); write(LS.bookings,arr); renderBookings() }
function deleteBooking(id){ const arr=read(LS.bookings).filter(b=>b.BookingID!==id); write(LS.bookings,arr); renderBookings() }

/* ---------- SERVICES ---------- */
function renderServices(filter=''){
  const tbody = $('#serviceTableBody'); tbody.innerHTML=''
  const list = read(LS.services).filter(s=>{
    const q=filter.trim().toLowerCase()
    if(!q) return true
    return s.ServiceName.toLowerCase().includes(q) || s.ServiceID.toLowerCase().includes(q)
  })
  list.forEach(s=>{
    const tr=document.createElement('tr')
    tr.innerHTML=`<td>${s.ServiceID}</td><td>${s.ServiceName}</td><td>${s.Price.toLocaleString()}</td>
      <td>
        <button class="btn small" data-id="${s.ServiceID}" data-action="edit">Sửa</button>
        <button class="btn small" data-id="${s.ServiceID}" data-action="del">Xóa</button>
      </td>`
    tbody.appendChild(tr)
  })
  tbody.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id=btn.dataset.id, act=btn.dataset.action
      if(act==='edit') openServiceForm('edit', id)
      if(act==='del'){ if(confirm('Xóa dịch vụ?')){ deleteService(id) } }
    })
  })
}
function addService(obj){ const arr=read(LS.services); arr.unshift(obj); write(LS.services,arr); renderServices() }
function updateService(id,payload){ const arr=read(LS.services).map(s=> s.ServiceID===id? {...s,...payload}:s); write(LS.services,arr); renderServices() }
function deleteService(id){ const arr=read(LS.services).filter(s=>s.ServiceID!==id); write(LS.services,arr); renderServices() }

/* ---------- INVOICES ---------- */
function renderInvoices(filter=''){
  const tbody = $('#invoiceTableBody'); tbody.innerHTML=''
  const list = read(LS.invoices).filter(i=>{
    const q=filter.trim().toLowerCase()
    if(!q) return true
    return i.InvoiceID.toLowerCase().includes(q) || i.BookingID.toLowerCase().includes(q)
  })
  list.forEach(i=>{
    const tr=document.createElement('tr')
    tr.innerHTML=`<td>${i.InvoiceID}</td><td>${i.BookingID}</td><td>${i.Total.toLocaleString()}</td><td>${i.Method}</td><td>${i.Date}</td>`
    tbody.appendChild(tr)
  })
}

/* ---------- Render All stats ---------- */
function renderAll(){
  renderCustomers($('#custSearch')?.value||'')
  renderRooms($('#roomSearch')?.value||'')
  renderBookings($('#bookingSearch')?.value||'')
  renderServices($('#serviceSearch')?.value||'')
  renderInvoices($('#invoiceSearch')?.value||'')

  $('#statCustomers').innerText = read(LS.customers).length
  $('#statRooms').innerText = read(LS.rooms).length
  $('#statBookings').innerText = read(LS.bookings).length
  const revenue = read(LS.invoices).reduce((s,i)=>s + Number(i.Total||0),0)
  $('#statRevenue').innerText = revenue.toLocaleString()
}

/* ---------- Modal helper ---------- */
const modal = $('#modal'), modalBody=$('#modalBody'), modalTitle=$('#modalTitle')
function openModal(title, innerHtml, onSave){
  modalTitle.innerText=title
  modalBody.innerHTML=innerHtml
  modal.classList.remove('hide')
  $('#modalClose').onclick = closeModal
  $('#modalCancel').onclick = closeModal
  $('#modalSave').onclick = ()=>{
    onSave()
    closeModal()
  }
}
function closeModal(){ modal.classList.add('hide'); modalBody.innerHTML='' }

/* ---------- Customer Form ---------- */
$('#addCustomerBtn').addEventListener('click', ()=> openCustomerForm('add') )
function openCustomerForm(mode, id){
  if(mode==='add'){
    const newId = uid('C')
    openModal('Thêm khách hàng', `
      <div class="form-row"><div class="col"><label>Tên</label><input id="f_name" class="input" /></div><div class="col"><label>Phone</label><input id="f_phone" class="input" /></div></div>
      <div class="form-row"><div class="col"><label>Email</label><input id="f_email" class="input" /></div><div class="col"><label>Ngày sinh</label><input id="f_dob" type="date" class="input" /></div></div>
    `, ()=>{
      const payload={CustomerID:newId, Name:$('#f_name').value.trim(), Phone:$('#f_phone').value.trim(), Email:$('#f_email').value.trim(), DOB:$('#f_dob').value}
      if(!payload.Name) return alert('Nhập tên')
      addCustomer(payload)
    })
  } else {
    const data = read(LS.customers).find(c=>c.CustomerID===id)
    openModal('Sửa khách hàng', `
      <div class="form-row"><div class="col"><label>Tên</label><input id="f_name" class="input" value="${data.Name}" /></div><div class="col"><label>Phone</label><input id="f_phone" class="input" value="${data.Phone}" /></div></div>
      <div class="form-row"><div class="col"><label>Email</label><input id="f_email" class="input" value="${data.Email||''}" /></div><div class="col"><label>Ngày sinh</label><input id="f_dob" type="date" class="input" value="${data.DOB||''}" /></div></div>
    `, ()=>{
      const payload={Name:$('#f_name').value.trim(), Phone:$('#f_phone').value.trim(), Email:$('#f_email').value.trim(), DOB:$('#f_dob').value}
      if(!payload.Name) return alert('Nhập tên')
      updateCustomer(id, payload)
    })
  }
}

/* ---------- Room Form ---------- */
$('#addRoomBtn').addEventListener('click', ()=> openRoomForm('add') )
function openRoomForm(mode, id){
  if(mode==='add'){
    const newId = uid('R')
    openModal('Thêm phòng', `
      <div class="form-row"><div class="col"><label>RoomID</label><input id="f_roomid" class="input" value="${newId}" /></div><div class="col"><label>Loại</label><input id="f_type" class="input" /></div></div>
      <div class="form-row"><div class="col"><label>Giá</label><input id="f_price" type="number" class="input" /></div><div class="col"><label>Trạng thái</label>
      <select id="f_status" class="input"><option>Trống</option><option>Đang thuê</option><option>Bảo trì</option></select></div></div>
    `, ()=>{
      const obj={RoomID:$('#f_roomid').value.trim(), Type:$('#f_type').value.trim(), Price: Number($('#f_price').value||0), Status:$('#f_status').value}
      if(!obj.RoomID||!obj.Type) return alert('Nhập đủ thông tin')
      addRoom(obj)
    })
  } else {
    const data = read(LS.rooms).find(r=>r.RoomID===id)
    openModal('Sửa phòng', `
      <div class="form-row"><div class="col"><label>RoomID</label><input id="f_roomid" class="input" value="${data.RoomID}" disabled/></div><div class="col"><label>Loại</label><input id="f_type" class="input" value="${data.Type}" /></div></div>
      <div class="form-row"><div class="col"><label>Giá</label><input id="f_price" type="number" class="input" value="${data.Price}" /></div><div class="col"><label>Trạng thái</label>
      <select id="f_status" class="input"><option ${data.Status==='Trống'?'selected':''}>Trống</option><option ${data.Status==='Đang thuê'?'selected':''}>Đang thuê</option><option ${data.Status==='Bảo trì'?'selected':''}>Bảo trì</option></select></div></div>
    `, ()=>{
      const payload={Type:$('#f_type').value.trim(), Price:Number($('#f_price').value||0), Status:$('#f_status').value}
      updateRoom(id, payload)
    })
  }
}

/* ---------- Booking Form ---------- */
$('#addBookingBtn').addEventListener('click', ()=> openBookingForm('add') )
function openBookingForm(mode, id){
  const customers = read(LS.customers), rooms = read(LS.rooms).filter(r=>r.Status!=='Bảo trì')
  const custOptions = customers.map(c=>`<option value="${c.CustomerID}">${c.Name} (${c.Phone})</option>`).join('')
  const roomOptions = rooms.map(r=>`<option value="${r.RoomID}">${r.RoomID} - ${r.Type}</option>`).join('')
  if(mode==='add'){
    const newId = uid('B')
    openModal('Tạo đặt phòng', `
      <div class="form-row"><div class="col"><label>Khách</label><select id="f_cust" class="input">${custOptions}</select></div><div class="col"><label>Phòng</label><select id="f_room" class="input">${roomOptions}</select></div></div>
      <div class="form-row"><div class="col"><label>Check-in</label><input id="f_checkin" type="date" class="input" /></div><div class="col"><label>Check-out</label><input id="f_checkout" type="date" class="input" /></div></div>
    `, ()=>{
      const obj={BookingID:newId, CustomerID:$('#f_cust').value, RoomID:$('#f_room').value, CheckIn:$('#f_checkin').value, CheckOut:$('#f_checkout').value, Status:'Booked'}
      if(!obj.CustomerID||!obj.RoomID) return alert('Chọn khách và phòng')
      addBooking(obj)
      // set room status to Đang thuê
      updateRoom(obj.RoomID, {Status:'Đang thuê'})
    })
  }
}

/* ---------- Service Form ---------- */
$('#addServiceBtn').addEventListener('click', ()=> openServiceForm('add') )
function openServiceForm(mode,id){
  if(mode==='add'){
    const newId = uid('SV')
    openModal('Thêm dịch vụ', `
      <div class="form-row"><div class="col"><label>Mã dịch vụ</label><input id="f_sid" class="input" value="${newId}" /></div><div class="col"><label>Tên</label><input id="f_sname" class="input" /></div></div>
      <div class="form-row"><div class="col"><label>Giá</label><input id="f_sprice" type="number" class="input" /></div><div class="col"></div></div>
    `, ()=>{
      const obj={ServiceID:$('#f_sid').value.trim(), ServiceName:$('#f_sname').value.trim(), Price:Number($('#f_sprice').value||0)}
      if(!obj.ServiceID||!obj.ServiceName) return alert('Nhập đủ')
      addService(obj)
    })
  } else {
    const data = read(LS.services).find(s=>s.ServiceID===id)
    openModal('Sửa dịch vụ', `
      <div class="form-row"><div class="col"><label>Mã dịch vụ</label><input id="f_sid" class="input" value="${data.ServiceID}" disabled /></div><div class="col"><label>Tên</label><input id="f_sname" class="input" value="${data.ServiceName}" /></div></div>
      <div class="form-row"><div class="col"><label>Giá</label><input id="f_sprice" type="number" class="input" value="${data.Price}" /></div><div class="col"></div></div>
    `, ()=>{
      const payload={ServiceName:$('#f_sname').value.trim(), Price:Number($('#f_sprice').value||0)}
      updateService(id,payload)
    })
  }
}

/* ---------- Booking view ---------- */
function viewBooking(id){
  const b = read(LS.bookings).find(x=>x.BookingID===id)
  const cust = read(LS.customers).find(c=>c.CustomerID===b.CustomerID)
  const room = read(LS.rooms).find(r=>r.RoomID===b.RoomID)
  openModal('Chi tiết đặt phòng', `
    <div><strong>BookingID:</strong> ${b.BookingID}</div>
    <div><strong>Khách:</strong> ${cust?.Name||b.CustomerID}</div>
    <div><strong>Phone:</strong> ${cust?.Phone||''}</div>
    <div><strong>Phòng:</strong> ${room?.RoomID||b.RoomID} (${room?.Type||''})</div>
    <div><strong>Check-in:</strong> ${b.CheckIn}</div>
    <div><strong>Check-out:</strong> ${b.CheckOut||''}</div>
    <div style="margin-top:8px"><button class="btn small primary" id="createInvoice">Tạo hóa đơn</button></div>
  `, ()=>{
    // noop default save (we also bind create invoice separately)
  })
  // bind create invoice
  setTimeout(()=>{
    const btn = $('#createInvoice')
    if(btn) btn.onclick = ()=>{
      const inv = {InvoiceID: uid('I'), BookingID: b.BookingID, Total: 1000000, Method:'Cash', Date: new Date().toISOString().slice(0,10)}
      const arr = read(LS.invoices); arr.unshift(inv); write(LS.invoices,arr); renderAll(); alert('Tạo hóa đơn mẫu xong'); closeModal()
    }
  }, 0)
}

/* ---------- basic attach events ---------- */
$('#modalClose').onclick = closeModal
$('#modalCancel').onclick = closeModal
$('#btnRefresh').onclick = ()=> renderAll()

// search handlers
$('#custSearch').addEventListener('input', (e)=> renderCustomers(e.target.value))
$('#roomSearch').addEventListener('input', (e)=> renderRooms(e.target.value))
$('#bookingSearch').addEventListener('input', (e)=> renderBookings(e.target.value))
$('#serviceSearch').addEventListener('input', (e)=> renderServices(e.target.value))
$('#invoiceSearch').addEventListener('input', (e)=> renderInvoices(e.target.value))
$('#globalSearch').addEventListener('input', (e)=>{
  const q = e.target.value
  renderCustomers(q); renderRooms(q); renderBookings(q); renderServices(q); renderInvoices(q);
})

// initial render
showPage('dashboard') 
renderAll()
console.log("Hotel PMS Loaded Successfully!");
