# Basarsoft Staj Projesi

Bu proje, Başarsoft stajı süresince geliştirilen bir **web uygulaması**dır. Projede hem **frontend** hem de **backend** geliştirme yapılmıştır. Backend geliştirmesi **C#** kullanılarak yapılmış olup, frontend geliştirmesi **HTML**, **CSS**, **JavaScript** ve **ReactJS** ile gerçekleştirilmiştir.

- [Basarsoft #1 Proje Videosunu İzlemek için Tıkla!](https://youtu.be/3Np1Q8gO2I8)
- [Basarsoft #2 Proje Videosunu İzlemek için Tıkla!](https://youtu.be/JHTp6F82n_E)

## İçindekiler
- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Teknolojiler](#teknolojiler)

## Özellikler
- **Kullanıcı yönetimi**: Kullanıcı kaydı, giriş ve yetkilendirme. (Reactjs Projesi için Eklenmektedir.)
- **Veri yönetimi**: CRUD operasyonları.
- **Harita entegrasyonu**: OpenLayers kullanarak harita üzerinde gösterim ve işlem yapma.
- **Responsive tasarım**: Mobil cihazlara uyumlu arayüz.

## Kurulum

### Gereksinimler
- .NET Core 5.0+
- Node.js
- ReactJS
- Postgresql

### Adımlar
1. **Depoyu klonlayın**:
    ```bash
    git clone https://github.com/berkkaya0304/basarsoft.git
    ```

2. **Backend'i başlatın**:
    - Visual Studio kullanarak proje dizinine gidin ve `Backend.sln` dosyasını açın.
    - Gerekli bağımlılıkları yüklemek için `dotnet restore` komutunu çalıştırın.
    - Projeyi çalıştırın.

3. **Frontend'i başlatın**:
    - Proje dizinine gidin ve `frontend` klasörüne girin.
    - Gerekli bağımlılıkları yüklemek için aşağıdaki komutu çalıştırın:
        ```bash
        npm install
        ```
    - Frontend uygulamasını başlatmak için:
        ```bash
        npm start
        ```

## Kullanım
Uygulama başlatıldığında, giriş yaparak kullanıcı profiline erişebilir, harita üzerinden verilerle etkileşime geçebilir ve yönetim panelini kullanabilirsiniz.

## Teknolojiler
- **Backend**: C#, .NET Core
- **Frontend**: HTML, CSS, JavaScript, ReactJS
- **Veritabanı**: PostgreSQL
- **Harita Entegrasyonu**: OpenLayers

