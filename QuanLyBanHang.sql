CREATE DATABASE QuanLyBanHang;
GO

USE QuanLyBanHang;
GO

CREATE TABLE LoaiMatHang (
    MaLoai VARCHAR(10) PRIMARY KEY,
    TenLoai NVARCHAR(50) NOT NULL
);

CREATE TABLE NhaCungCap (
    MaNhaCungCap VARCHAR(10) PRIMARY KEY,
    TenNhaCungCap NVARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(11) NOT NULL,
    DiaChi NVARCHAR(200) NOT NULL
);

CREATE TABLE KhachHang (
    MaKhachHang VARCHAR(10) PRIMARY KEY,
    TenKhachHang NVARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(11) NOT NULL
);

CREATE TABLE NhanVien (
    MaNhanVien VARCHAR(10) PRIMARY KEY,
    TenNhanVien NVARCHAR(100) NOT NULL,
    ChucVu NVARCHAR(50) NOT NULL,
    PhongBan NVARCHAR(100) NOT NULL
);

CREATE TABLE MatHang (
    MaMatHang VARCHAR(10) PRIMARY KEY,
    MaLoai VARCHAR(10) NOT NULL,
    TenMatHang NVARCHAR(100) NOT NULL,
    GiaBan DECIMAL(18,0) NOT NULL,
    CONSTRAINT FK_MatHang_LoaiMatHang
        FOREIGN KEY (MaLoai)
        REFERENCES LoaiMatHang(MaLoai)
);

CREATE TABLE DonHang (
    MaDonHang VARCHAR(10) PRIMARY KEY,
    MaKhachHang VARCHAR(10) NOT NULL,
    MaNhanVien VARCHAR(10) NOT NULL,
    ThoiGian DATE NOT NULL,
    TongTienThanhToan DECIMAL(18,0) NOT NULL,
    CONSTRAINT FK_DonHang_KhachHang
        FOREIGN KEY (MaKhachHang)
        REFERENCES KhachHang(MaKhachHang),
    CONSTRAINT FK_DonHang_NhanVien
        FOREIGN KEY (MaNhanVien)
        REFERENCES NhanVien(MaNhanVien)
);

CREATE TABLE CungCap (
    MaNhaCungCap VARCHAR(10) NOT NULL,
    MaMatHang VARCHAR(10) NOT NULL,
    PRIMARY KEY (MaNhaCungCap, MaMatHang),
    CONSTRAINT FK_CungCap_NhaCungCap
        FOREIGN KEY (MaNhaCungCap)
        REFERENCES NhaCungCap(MaNhaCungCap),
    CONSTRAINT FK_CungCap_MatHang
        FOREIGN KEY (MaMatHang)
        REFERENCES MatHang(MaMatHang)
);

CREATE TABLE ChiTietDonHang (
    MaDonHang VARCHAR(10) NOT NULL,
    MaMatHang VARCHAR(10) NOT NULL,
    SoLuong INT NOT NULL,
    GiaMua DECIMAL(18,0) NOT NULL,
    PRIMARY KEY (MaDonHang, MaMatHang),
    CONSTRAINT FK_ChiTietDonHang_DonHang
        FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang),
    CONSTRAINT FK_ChiTietDonHang_MatHang
        FOREIGN KEY (MaMatHang)
        REFERENCES MatHang(MaMatHang)
);

INSERT INTO LoaiMatHang (MaLoai, TenLoai) VALUES
('ML01', 'DoAn'),
('ML02', 'DoUong'),
('ML03', 'DoGiaDung'),
('ML04', 'VanPhongPham'),
('ML05', 'DoDungHocTap');

INSERT INTO MatHang (MaMatHang, MaLoai, TenMatHang, GiaBan) VALUES
('MMH01', 'ML01', 'Mi Tom', 10000),
('MMH02', 'ML01', 'Banh Mi', 15000),
('MMH03', 'ML02', 'Nuoc Ngot', 10000),
('MMH04', 'ML02', 'Tra Sua', 30000),
('MMH05', 'ML03', 'Noi Com Dien', 1000000),
('MMH06', 'ML03', 'Quat Dien', 500000),
('MMH07', 'ML04', 'But Bi', 5000),
('MMH08', 'ML04', 'So ghi chep', 12000),
('MMH09', 'ML05', 'Balo Hoc Sinh', 300000),
('MMH10', 'ML05', 'Thuoc Ke', 20000);

INSERT INTO NhaCungCap (MaNhaCungCap, TenNhaCungCap, SoDienThoai, DiaChi) VALUES
('MNCC01', 'Cong Ty Thuc Pham Sai Gon', '0901234567', '12 Nguyen Trai/Quan 1/TPHCM'),
('MNCC02', 'Cong Ty Dien May Hoang Long', '0912345678', '45 Le Loi/Quan 3/TPHCM'),
('MNCC03', 'Cong Ty Nong San Mien Tay', '0987654321', '78 Hung Vuong/Quan Ninh Kieu/Can Tho'),
('MNCC04', 'Cong Ty Gia Dung Minh Phat', '0978123456', '23 Tran Phu/Quan Hai Chau/Da Nang');

INSERT INTO CungCap (MaNhaCungCap, MaMatHang) VALUES
('MNCC01', 'MMH01'),
('MNCC01', 'MMH02'),
('MNCC02', 'MMH03'),
('MNCC02', 'MMH04'),
('MNCC03', 'MMH01'),
('MNCC03', 'MMH02'),
('MNCC04', 'MMH05'),
('MNCC04', 'MMH03');

INSERT INTO KhachHang (MaKhachHang, TenKhachHang, SoDienThoai) VALUES
('MKH01','Nguyen Van An','0912345678'),
('MKH02','Tran Thi Bich','0987654321'),
('MKH03','Le Minh Hoang','0905123456'),
('MKH04','Pham Gia Bao','0938765432'),
('MKH05','Hoang Thi Lan','0977123456'),
('MKH06','Do Thanh Tung','0923456789'),
('MKH07','Vu Ngoc Anh','0965432109'),
('MKH08','Bui Thi My','0945678123');

INSERT INTO NhanVien (MaNhanVien, TenNhanVien, ChucVu, PhongBan) VALUES
('MNV01','Nguyen Thanh Long','QuanLy','Quan ly cua hang'),
('MNV02','Tran Thi Mai','ThuNgan','Ke toan'),
('MNV03','Le Quoc Huy','BanHang','Marketing'),
('MNV04','Pham Van Duc','KhoHang','Kho va van chuyen'),
('MNV05','Hoang Gia Linh','BanHang','Quan ly cua hang');

INSERT INTO DonHang (MaDonHang, MaKhachHang, MaNhanVien, ThoiGian, TongTienThanhToan) VALUES
('MDH01','MKH01','MNV01','2026-03-01',150000),
('MDH02','MKH02','MNV02','2026-03-02',230000),
('MDH03','MKH03','MNV03','2026-03-03',120000),
('MDH04','MKH04','MNV04','2026-03-04',540000),
('MDH05','MKH05','MNV01','2026-03-05',310000),
('MDH06','MKH01','MNV02','2026-03-06',450000),
('MDH07','MKH02','MNV03','2026-03-07',275000);

INSERT INTO ChiTietDonHang (MaDonHang, MaMatHang, SoLuong, GiaMua) VALUES
('MDH01','MMH01',10,10000),
('MDH01','MMH03',5,10000),
('MDH02','MMH02',10,15000),
('MDH02','MMH04',3,30000),
('MDH03','MMH03',12,10000),
('MDH04','MMH06',1,500000),
('MDH04','MMH01',4,10000),
('MDH05','MMH09',1,300000),
('MDH05','MMH07',2,5000),
('MDH06','MMH09',1,300000),
('MDH06','MMH02',10,15000),
('MDH07','MMH02',5,15000),
('MDH07','MMH03',20,10000);

--1) Danh sách các mặt hàng có giá bán từ 30000 trở lên
Select MatHang.MaMatHang, MatHang.TenMatHang, MatHang.GiaBan
From MatHang
Where MatHang.GiaBan >= 30000;
--2) Danh sách nhân viên có chức vụ là bán hàng
Select NhanVien.MaNhanVien, NhanVien.TenNhanVien, NhanVien.ChucVu
From NhanVien
Where NhanVien.ChucVu = 'BanHang';
--3) Danh sách đơn hàng kèm tên khách hàng và tổng tiền, chỉ lấy đơn hàng trên 200000
Select DonHang.MaDonHang, KhachHang.TenKhachHang, DonHang.ThoiGian, DonHang.TongTienThanhToan
From DonHang
Inner Join KhachHang On DonHang.MaKhachHang = KhachHang.MaKhachHang
Where DonHang.TongTienThanhToan > 200000;
--4) Danh sách đơn hàng kèm tên nhân viên lập đơn
Select DonHang.MaDonHang, NhanVien.TenNhanVien, DonHang.ThoiGian
From DonHang
Inner Join NhanVien On DonHang.MaNhanVien = NhanVien.MaNhanVien
Where NhanVien.ChucVu = 'BanHang';
--5) Danh sách nhà cung cấp ở TPHCM và các mặt hàng mà họ cung cấp
Select CungCap.MaNhaCungCap, NhaCungCap.TenNhaCungCap, CungCap.MaMatHang
From CungCap
Inner Join NhaCungCap On CungCap.MaNhaCungCap = NhaCungCap.MaNhaCungCap
Where NhaCungCap.DiaChi Like N'%TPHCM%';
--6) Thống kê số đơn hàng của từng khách hàng trong tháng 03/2026
Select DonHang.MaKhachHang, Count(DonHang.MaDonHang)
From DonHang
Where DonHang.ThoiGian Between '2026-03-01' And '2026-03-31'
Group By DonHang.MaKhachHang;
--7) Thống kê tổng số lượng đã bán theo từng mặt hàng
Select ChiTietDonHang.MaMatHang, Sum(ChiTietDonHang.SoLuong)
From ChiTietDonHang
Where ChiTietDonHang.SoLuong > 1
Group By ChiTietDonHang.MaMatHang;
--8) Khách hàng nào đã đặt ít nhất 2 đơn hàng trong tháng 03/2026
Select DonHang.MaKhachHang, Count(DonHang.MaDonHang)
From DonHang
Where DonHang.ThoiGian Between '2026-03-01' And '2026-03-31'
Group By DonHang.MaKhachHang
Having Count(DonHang.MaDonHang) >= 2;
--9) Mặt hàng nào có tổng số lượng bán ra lớn hơn 10
Select ChiTietDonHang.MaMatHang, Sum(ChiTietDonHang.SoLuong)
From ChiTietDonHang
Where ChiTietDonHang.SoLuong >= 1
Group By ChiTietDonHang.MaMatHang
Having Sum(ChiTietDonHang.SoLuong) > 10;
--10) Nhà cung cấp nào ở TPHCM đang cung cấp từ 2 mặt hàng trở lên
Select NhaCungCap.MaNhaCungCap, NhaCungCap.TenNhaCungCap, Count(CungCap.MaMatHang)
From NhaCungCap
Inner Join CungCap On NhaCungCap.MaNhaCungCap = CungCap.MaNhaCungCap
Where NhaCungCap.DiaChi Like N'%TPHCM%'
Group By NhaCungCap.MaNhaCungCap, NhaCungCap.TenNhaCungCap
Having Count(CungCap.MaMatHang) >= 2;
--11) Xếp danh sách khách hàng theo số đơn hàng giảm dần
Select DonHang.MaKhachHang, Count(DonHang.MaDonHang)
From DonHang
Group By DonHang.MaKhachHang
Having Count(DonHang.MaDonHang) >= 1
Order By Count(DonHang.MaDonHang) Desc;
--12) Xếp danh sách nhà cung cấp theo số mặt hàng cung cấp giảm dần
Select NhaCungCap.MaNhaCungCap, NhaCungCap.TenNhaCungCap, Count(CungCap.MaMatHang)
From NhaCungCap
Inner Join CungCap On NhaCungCap.MaNhaCungCap = CungCap.MaNhaCungCap
Where NhaCungCap.DiaChi Like N'%TPHCM%'
Group By NhaCungCap.MaNhaCungCap, NhaCungCap.TenNhaCungCap
Having Count(CungCap.MaMatHang) >= 2
Order By Count(CungCap.MaMatHang) Desc;
--13) Khách hàng nào có tổng tiền mua hàng lớn hơn giá trị trung bình của toàn bộ đơn hàng
Select DonHang.MaKhachHang, Sum(DonHang.TongTienThanhToan)
From DonHang
Group By DonHang.MaKhachHang
Having Sum(DonHang.TongTienThanhToan) > (Select Avg(DonHang.TongTienThanhToan) From DonHang);
--14) Loại mặt hàng nào có số lượng mặt hàng nhiều hơn mức trung bình số mặt hàng trong các loại
Select MatHang.MaLoai, Count(MatHang.MaMatHang)
From MatHang
Group By MatHang.MaLoai
Having Count(MatHang.MaMatHang) > (Select Count(MatHang.MaMatHang) / Count(Distinct MatHang.MaLoai) From MatHang);
--15) Thêm một khách hàng mới nếu mã khách hàng chưa tồn tại
If Not Exists (Select 1 From KhachHang Where MaKhachHang = 'MKH09')
Begin
    Insert Into KhachHang (MaKhachHang, TenKhachHang, SoDienThoai)
    Values ('MKH09', 'Nguyen Van Khoa', '0911000000');
End;
--16) Thêm quan hệ cung cấp mới nếu cặp nhà cung cấp và mặt hàng chưa tồn tại
If Not Exists (Select 1 From CungCap Where MaNhaCungCap = 'MNCC01' And MaMatHang = 'MMH03')
Begin
    Insert Into CungCap (MaNhaCungCap, MaMatHang)
    Values ('MNCC01', 'MMH03');
End;
--17) Tăng giá bán của toàn bộ mặt hàng thuộc loại đồ gia dụng lên 5%
Update MatHang
Set GiaBan = GiaBan * 105 / 100
Where MaLoai = 'ML03';
--18) Cập nhật phòng ban của nhân viên bán hàng thành Kinh doanh
Update NhanVien
Set PhongBan = N'Kinh doanh'
Where ChucVu = 'BanHang';
--19) Xóa các chi tiết đơn hàng của những mặt hàng thuộc loại đồ dùng học tập
Delete ChiTietDonHang
From ChiTietDonHang
Inner Join MatHang On ChiTietDonHang.MaMatHang = MatHang.MaMatHang
Where MatHang.MaLoai = 'ML05';
--20) Xóa các dòng cung cấp của nhà cung cấp MNCC03
Delete CungCap
From CungCap
Inner Join NhaCungCap On CungCap.MaNhaCungCap = NhaCungCap.MaNhaCungCap
Where NhaCungCap.MaNhaCungCap = 'MNCC03';