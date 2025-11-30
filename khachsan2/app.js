// ===========================================
//  DATA — DỮ LIỆU MẪU / LOCALSTORAGE
// ===========================================
let customers = JSON.parse(localStorage.getItem("customers")) || [
  { id: 1, name: "Nguyễn Văn A", phone: "0901234567", email: "a@gmail.com", birthday: "1998-05-20" },
  { id: 2, name: "Trần Thị B", phone: "0909876543", email: "b@gmail.com", birthday: "1995-11-12" }
];

let rooms = JSON.parse(localStorage.getItem("rooms")) || [
  { id: 101, type: "Deluxe", price: 800000, status: "Trống" },
  { id: 102, type: "Standard", price: 500000, status: "Đang sử dụng" }
];

let bookings = JSON.parse(localStorage.getItem("bookings")) || [
  { id: 1, customerId: 1, roomId: 101, checkIn: "2025-01-10", checkOut: "2025-01-12", status: "Hoàn tất" }
];

let services = JSON.parse(localStorage.getItem("services")) || [
  { id: 1, name: "Giặt ủi", price: 50000 },
  { id: 2, name: "Ăn sáng", price: 80000 }
];

let invoices = JSON.parse(localStorage.getItem("invoices")) || [];

// ===========================================
//  HELPER
// ===========================================
function nextId(list) {
  return list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
}

function saveData() {
  localStorage.setItem("customers", JSON.stringify(customers));
  localStorage.setItem("rooms", JSON.stringify(rooms));
  localStorage.setItem("bookings", JSON.stringify(bookings));
  localStorage.setItem("services", JSON.stringify(services));
  localStorage.setItem("invoices", JSON.stringify(invoices));
}

function getCustomerById(id) {
  return customers.find(c => c.id === id);
}

function getRoomById(id) {
  return rooms.find(r => r.id === id);
}

// ===========================================
//  RENDER TABLES
// ===========================================
function renderCustomers() {
  const tb = document.getElementById("custTable");
  tb.innerHTML = customers.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.phone}</td>
      <td>${c.email}</td>
      <td>${c.birthday}</td>
      <td>
        <button class="btn small" onclick="editCustomer(${c.id})">Sửa</button>
        <button class="btn small danger" onclick="deleteCustomer(${c.id})">Xóa</button>
      </td>
    </tr>
  `).join("");
}

function renderRooms() {
  const tb = document.getElementById("roomTable");
  tb.innerHTML = rooms.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.type}</td>
      <td>${r.price.toLocaleString()}</td>
      <td>${r.status}</td>
      <td>
        <button class="btn small" onclick="editRoom(${r.id})">Sửa</button>
        <button class="btn small danger" onclick="deleteRoom(${r.id})">Xóa</button>
      </td>
    </tr>
  `).join("");
}

function renderBookings() {
  const tb = document.getElementById("bookingTable");
  tb.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.id}</td>
      <td>${getCustomerById(b.customerId)?.name}</td>
      <td>${b.roomId}</td>
      <td>${b.checkIn}</td>
      <td>${b.checkOut}</td>
      <td>${b.status}</td>
      <td>
        <button class="btn small" onclick="editBooking(${b.id})">Sửa</button>
        <button class="btn small danger" onclick="deleteBooking(${b.id})">Xóa</button>
        <button class="btn small primary" onclick="createInvoice(${b.id})">Hóa đơn</button>
      </td>
    </tr>
  `).join("");
}

function renderServices() {
  const tb = document.getElementById("serviceTable");
  tb.innerHTML = services.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.price.toLocaleString()}</td>
      <td>
        <button class="btn small" onclick="editService(${s.id})">Sửa</button>
        <button class="btn small danger" onclick="deleteService(${s.id})">Xóa</button>
      </td>
    </tr>
  `).join("");
}

function renderInvoices() {
  const tb = document.getElementById("invoiceTable");
  tb.innerHTML = invoices.map(i => `
    <tr>
      <td>${i.id}</td>
      <td>${i.bookingId}</td>
      <td>${i.total.toLocaleString()}</td>
      <td>${i.method}</td>
      <td>${i.date}</td>
    </tr>
  `).join("");
}

// ===========================================
// DASHBOARD
// ===========================================
function renderDashboard() {
  document.getElementById("statCustomers").textContent = customers.length;
  document.getElementById("statRooms").textContent = rooms.length;
  document.getElementById("statBookings").textContent = bookings.length;
  let revenue = invoices.reduce((sum, i) => sum + i.total, 0);
  document.getElementById("statRevenue").textContent = revenue.toLocaleString();
}

// ===========================================
//  MODAL
// ===========================================
function openModal(title, body) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = body;
  document.getElementById("modal").classList.remove("hide");
}

function closeModal() {
  document.getElementById("modal").classList.add("hide");
}

document.getElementById("modalClose").onclick = closeModal;
document.getElementById("modalCancel").onclick = closeModal;

// ===========================================
//  RENDER ALL
// ===========================================
function renderAll() {
  renderCustomers();
  renderRooms();
  renderBookings();
  renderServices();
  renderInvoices();
  renderDashboard();
}

// ===========================================
//  CRUD KHÁCH HÀNG
// ===========================================
let editingCustomerId = null;

document.getElementById("btnAddCustomer").onclick = () => {
  editingCustomerId = null;
  openModal("Thêm khách", `
    <label>Tên:</label><br><input id="cName"><br><br>
    <label>SĐT:</label><br><input id="cPhone"><br><br>
    <label>Email:</label><br><input id="cEmail"><br><br>
    <label>Ngày sinh:</label><br><input type="date" id="cBirth">
  `);
  document.getElementById("modalSave").onclick = saveCustomer;
};

function saveCustomer() {
  const name = document.getElementById("cName").value.trim();
  const phone = document.getElementById("cPhone").value.trim();
  const email = document.getElementById("cEmail").value.trim();
  const birth = document.getElementById("cBirth").value;

  if (!name) return alert("Nhập tên khách!");
  if (editingCustomerId) {
    let c = customers.find(x => x.id === editingCustomerId);
    c.name = name; c.phone = phone; c.email = email; c.birthday = birth;
  } else {
    customers.push({ id: nextId(customers), name, phone, email, birthday: birth });
  }

  saveData();
  closeModal();
  renderAll();
}

function editCustomer(id) {
  editingCustomerId = id;
  const c = customers.find(x => x.id === id);
  openModal("Sửa khách", `
    <label>Tên:</label><br><input id="cName" value="${c.name}"><br><br>
    <label>SĐT:</label><br><input id="cPhone" value="${c.phone}"><br><br>
    <label>Email:</label><br><input id="cEmail" value="${c.email}"><br><br>
    <label>Ngày sinh:</label><br><input type="date" id="cBirth" value="${c.birthday}">
  `);
  document.getElementById("modalSave").onclick = saveCustomer;
}

function deleteCustomer(id) {
  if (!confirm("Xác nhận xóa khách này?")) return;
  customers = customers.filter(c => c.id !== id);
  saveData();
  renderAll();
}

// ===========================================
//  CRUD PHÒNG
// ===========================================
let editingRoomId = null;

document.getElementById("btnAddRoom").onclick = () => {
  editingRoomId = null;
  openModal("Thêm phòng", `
    <label>Room ID:</label><br><input id="rId"><br><br>
    <label>Loại:</label><br><input id="rType"><br><br>
    <label>Giá:</label><br><input id="rPrice"><br><br>
    <label>Trạng thái:</label><br><input id="rStatus">
  `);
  document.getElementById("modalSave").onclick = saveRoom;
};

function saveRoom() {
  const id = Number(document.getElementById("rId").value);
  const type = document.getElementById("rType").value.trim();
  const price = Number(document.getElementById("rPrice").value);
  const status = document.getElementById("rStatus").value.trim();
  if (!type) return alert("Nhập loại phòng!");
  if (editingRoomId) {
    let r = rooms.find(x => x.id === editingRoomId);
    r.id = id; r.type = type; r.price = price; r.status = status;
  } else {
    rooms.push({ id, type, price, status });
  }
  saveData(); closeModal(); renderAll();
}

function editRoom(id) {
  editingRoomId = id;
  const r = rooms.find(x => x.id === id);
  openModal("Sửa phòng", `
    <label>Room ID:</label><br><input id="rId" value="${r.id}"><br><br>
    <label>Loại:</label><br><input id="rType" value="${r.type}"><br><br>
    <label>Giá:</label><br><input id="rPrice" value="${r.price}"><br><br>
    <label>Trạng thái:</label><br><input id="rStatus" value="${r.status}">
  `);
  document.getElementById("modalSave").onclick = saveRoom;
}

function deleteRoom(id) {
  if (!confirm("Xác nhận xóa phòng này?")) return;
  rooms = rooms.filter(r => r.id !== id);
  saveData(); renderAll();
}

// ===========================================
//  CRUD BOOKING
// ===========================================
let editingBookingId = null;

document.getElementById("btnAddBooking").onclick = () => {
  editingBookingId = null;
  openModal("Tạo đặt phòng", `
    <label>ID Khách:</label><br><input id="bCust"><br><br>
    <label>Phòng:</label><br><input id="bRoom"><br><br>
    <label>Check-in:</label><br><input type="date" id="bIn"><br><br>
    <label>Check-out:</label><br><input type="date" id="bOut">
  `);
  document.getElementById("modalSave").onclick = saveBooking;
};

function saveBooking() {
  const customerId = Number(document.getElementById("bCust").value);
  const roomId = Number(document.getElementById("bRoom").value);
  const checkIn = document.getElementById("bIn").value;
  const checkOut = document.getElementById("bOut").value;
  if (!customerId || !roomId) return alert("Nhập khách và phòng!");
  if (editingBookingId) {
    let b = bookings.find(x => x.id === editingBookingId);
    b.customerId = customerId; b.roomId = roomId; b.checkIn = checkIn; b.checkOut = checkOut;
  } else {
    bookings.push({ id: nextId(bookings), customerId, roomId, checkIn, checkOut, status: "Đang xử lý" });
  }
  saveData(); closeModal(); renderAll();
}

function editBooking(id) {
  editingBookingId = id;
  const b = bookings.find(x => x.id === id);
  openModal("Sửa booking", `
    <label>ID Khách:</label><br><input id="bCust" value="${b.customerId}"><br><br>
    <label>Phòng:</label><br><input id="bRoom" value="${b.roomId}"><br><br>
    <label>Check-in:</label><br><input type="date" id="bIn" value="${b.checkIn}"><br><br>
    <label>Check-out:</label><br><input type="date" id="bOut" value="${b.checkOut}">
  `);
  document.getElementById("modalSave").onclick = saveBooking;
}

function deleteBooking(id) {
  if (!confirm("Xác nhận xóa booking này?")) return;
  bookings = bookings.filter(b => b.id !== id);
  saveData(); renderAll();
}

// ===========================================
//  CRUD SERVICES
// ===========================================
let editingServiceId = null;

document.getElementById("btnAddService").onclick = () => {
  editingServiceId = null;
  openModal("Thêm dịch vụ", `
    <label>Tên dịch vụ:</label><br><input id="sName"><br><br>
    <label>Giá:</label><br><input id="sPrice">
  `);
  document.getElementById("modalSave").onclick = saveService;
};

function saveService() {
  const name = document.getElementById("sName").value.trim();
  const price = Number(document.getElementById("sPrice").value);
  if (!name) return alert("Nhập tên dịch vụ!");
  if (editingServiceId) {
    let s = services.find(x => x.id === editingServiceId);
    s.name = name; s.price = price;
  } else {
    services.push({ id: nextId(services), name, price });
  }
  saveData(); closeModal(); renderAll();
}

function editService(id) {
  editingServiceId = id;
  const s = services.find(x => x.id === id);
  openModal("Sửa dịch vụ", `
    <label>Tên dịch vụ:</label><br><input id="sName" value="${s.name}"><br><br>
    <label>Giá:</label><br><input id="sPrice" value="${s.price}">
  `);
  document.getElementById("modalSave").onclick = saveService;
}

function deleteService(id) {
  if (!confirm("Xác nhận xóa dịch vụ này?")) return;
  services = services.filter(s => s.id !== id);
  saveData(); renderAll();
}

// ===========================================
//  TẠO HÓA ĐƠN
// ===========================================
function createInvoice(bookingId) {
    const b = bookings.find(x => x.id === bookingId);
    const r = getRoomById(b.roomId);
    const days = Math.max(1, (new Date(b.checkOut) - new Date(b.checkIn)) / (1000*60*60*24));

    const serviceOptions = services.map(s => `
        <label><input type="checkbox" value="${s.id}"> ${s.name} (${s.price.toLocaleString()}₫)</label><br>
    `).join("");

    openModal(`Hóa đơn Booking ${bookingId}`, `
        <div>Phòng: ${r?.type} - ${r?.price.toLocaleString()}₫ x ${days} đêm</div>
        <h4>Chọn dịch vụ/quà kèm theo:</h4>
        <div>${serviceOptions}</div>
    `);

    document.getElementById("modalSave").onclick = () => {
        const selectedServices = Array.from(document.querySelectorAll("#modalBody input[type=checkbox]:checked"))
            .map(input => Number(input.value));

        const serviceTotal = selectedServices.reduce((sum, id) => {
            const s = services.find(x => x.id === id);
            return sum + (s?.price || 0);
        }, 0);

        const roomTotal = (r?.price || 0) * days;
        const total = roomTotal + serviceTotal;

        invoices.push({
            id: nextId(invoices),
            bookingId,
            total,
            method: "Tiền mặt",
            date: new Date().toISOString().split("T")[0],
            services: selectedServices
        });

        closeModal();
        renderAll();
        alert("Hóa đơn đã được tạo!");
    };
}
// ===========================================
//  MENU — CHUYỂN TRANG
// ===========================================
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".page");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const page = item.getAttribute("data-page");
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      pages.forEach(p => p.classList.add("hide"));
      document.getElementById(page).classList.remove("hide");
    });
  });
  renderAll();
});
