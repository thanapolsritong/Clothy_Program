# Clothy — Class Diagram

```mermaid
classDiagram
    direction TB

    %% ─────────────────────────────────────────
    %% ERROR HIERARCHY  (Backend · server.js)
    %% ─────────────────────────────────────────
    class Error {
        +message : string
    }

    class AppError {
        +name       : string
        +statusCode : int
        +AppError(message, statusCode)
    }

    class ResourceNotFoundException {
        +ResourceNotFoundException(resource)
    }

    class DatabaseException {
        +DatabaseException(message)
    }

    class ValidationException {
        +ValidationException(message)
    }

    Error              <|-- AppError
    AppError           <|-- ResourceNotFoundException
    AppError           <|-- DatabaseException
    AppError           <|-- ValidationException

    %% ─────────────────────────────────────────
    %% MODEL CLASSES  (Backend JS + Frontend TS)
    %% ─────────────────────────────────────────
    class BaseModel {
        <<abstract>>
        -id : string
        +getId()    string
        +toString() string
    }

    class Customer {
        -name       : string
        -phone      : string
        -department : string
        -address    : string
        +getName()       string
        +getPhone()      string
        +getDepartment() string
        +getAddress()    string
        +setName(name)   void
        +display()       string
        +toString()      string
    }

    class Outfit {
        -customerId   : string
        -name         : string
        -status       : OutfitStatus
        -measurements : Record
        -photos       : Photo[]
        +getCustomerId()   string
        +getName()         string
        +getStatus()       OutfitStatus
        +getMeasurements() Record
        +getPhotos()       Photo[]
        +setName(name)     void
        +setStatus(status) void
        +addPhoto(photo)   void
        +removePhoto(id)   void
        +isDeadlineSoon()  boolean
        +toString()        string
    }

    class Photo {
        -outfitId : string
        -url      : string
        -caption  : string
        +getOutfitId()       string
        +getUrl()            string
        +getCaption()        string
        +setCaption(caption) void
        +toString()          string
    }

    BaseModel <|-- Customer
    BaseModel <|-- Outfit
    BaseModel <|-- Photo

    Outfit "1" o-- "*" Photo : contains

    %% ─────────────────────────────────────────
    %% REPOSITORY CLASSES  (Backend · server.js)
    %% ─────────────────────────────────────────
    class CustomerRepository {
        +findAll()                          Customer[]
        +create(name, phone, dept, address) Customer
        +rename(id, newName)                void
        +delete(id)                         void
    }

    class OutfitRepository {
        +findAll()                    Outfit[]
        +create(customerId, name)     Outfit
        +rename(id, newName)          void
        +update(id, data)             void
        +delete(id)                   void
    }

    class PhotoRepository {
        +findAll()                     Photo[]
        +create(outfitId, url, caption) Photo
        +updateCaption(id, caption)    void
        +delete(id)                    void
    }

    CustomerRepository ..> Customer : «creates»
    OutfitRepository   ..> Outfit   : «creates»
    PhotoRepository    ..> Photo    : «creates»

    CustomerRepository ..> DatabaseException        : «throws»
    CustomerRepository ..> ValidationException      : «throws»
    CustomerRepository ..> ResourceNotFoundException : «throws»
    OutfitRepository   ..> DatabaseException        : «throws»
    OutfitRepository   ..> ValidationException      : «throws»
    OutfitRepository   ..> ResourceNotFoundException : «throws»
```

---

## OOP Concepts ที่ปรากฏใน Diagram

| Concept | ตัวอย่างในโปรเจค |
|---|---|
| **Encapsulation** | ทุก field เป็น `private` (`#` ใน JS / `private` ใน TS), เข้าถึงผ่าน getter/setter เท่านั้น |
| **Inheritance** | `Customer`, `Outfit`, `Photo` extends `BaseModel` |
| **Inheritance (Error)** | `ResourceNotFoundException`, `DatabaseException`, `ValidationException` extends `AppError` extends `Error` |
| **Abstraction** | `BaseModel` เป็น abstract class บังคับ subclass ให้ implement `toString()` |
| **Polymorphism** | ทุก subclass override `toString()` และ `toJSON()` ต่างกัน |
| **Association** | `Outfit` มี `Photo[]` (Aggregation) |
| **Dependency** | Repository classes สร้าง Model objects และ throw Error objects |
