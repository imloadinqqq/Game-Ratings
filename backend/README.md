# GameDB Database Schema Documentation

The **GameDB** database is designed to store detailed information about video games, their genres, publishers, user ratings, and associated media. Below is an overview of each table and their relationships.

---

## 📋 Tables Overview

### 1. `Genres`
Stores unique game genres.

| Column     | Type          | Description           |
|------------|---------------|-----------------------|
| GenreID    | INT (PK)      | Unique identifier     |
| GenreName  | VARCHAR(255)  | Name of the genre (unique) |

---

### 2. `Games`
Stores general game information.

| Column      | Type           | Description                       |
|-------------|----------------|-----------------------------------|
| GameID      | INT (PK)       | Unique game identifier            |
| GameTitle   | VARCHAR(255)   | Title of the game                 |
| ReleaseDate | DATE           | Release date (required)           |
| Publisher   | VARCHAR(100)   | (Legacy; can be replaced by GamePublishers) |
| AgeRating   | VARCHAR(5)     | Age rating (e.g., E, M, T, etc.)  |
| GenreID     | INT (FK)       | Foreign key to `Genres`           |

---

### 3. `Users`
Stores user data.

| Column         | Type          | Description                   |
|----------------|---------------|-------------------------------|
| UserID         | INT (PK)      | Unique user identifier        |
| UserName       | VARCHAR(255)  | Username                      |
| PasswordHashed | VARCHAR(255)  | Hashed password               |

---

### 4. `Ratings`
Stores game ratings from users.

| Column   | Type           | Description                       |
|----------|----------------|-----------------------------------|
| RatingID | INT (PK)       | Unique rating ID                  |
| UserID   | INT (FK)       | User who rated                    |
| GameID   | INT (FK)       | Rated game                        |
| Rating   | DECIMAL(2,1)   | Score (1.0 to 5.0 inclusive)      |

---

### 5. `GameImages`
Stores binary image data associated with games.

| Column     | Type           | Description                          |
|------------|----------------|--------------------------------------|
| ImageID    | INT (PK)       | Unique image ID                      |
| GameID     | INT (FK)       | Associated game                      |
| ImageData  | LONGBLOB       | Binary image content                 |
| ImageName  | VARCHAR(255)   | Optional name for the image file     |

---

### 6. `GameGenres`
Handles many-to-many relationships between games and genres.

| Column        | Type       | Description               |
|---------------|------------|---------------------------|
| GameGenresID  | INT (PK)   | Unique ID                 |
| GameID        | INT (FK)   | Associated game           |
| GenreID       | INT (FK)   | Associated genre          |

---

### 7. `Publishers`
Stores information about publishers.

| Column        | Type           | Description          |
|---------------|----------------|----------------------|
| PublisherID   | INT (PK)       | Unique ID            |
| PublisherName | VARCHAR(255)   | Name of the publisher|

---

### 8. `GamePublishers`
Handles many-to-many relationships between games and publishers.

| Column           | Type     | Description             |
|------------------|----------|-------------------------|
| GamePublishersID | INT (PK) | Unique ID               |
| GameID           | INT (FK) | Associated game         |
| PublisherID      | INT (FK) | Associated publisher    |

---

## 🧩 Relationships

- **Games ↔ Genres**: Many-to-One (`Games.GenreID → Genres.GenreID`)
- **Games ↔ Users (Ratings)**: Many-to-Many via `Ratings`
- **Games ↔ Genres (Multiple)**: Many-to-Many via `GameGenres`
- **Games ↔ Publishers**: Many-to-Many via `GamePublishers`
- **Games ↔ GameImages**: One-to-Many via `GameImages`
- **Users ↔ Ratings**: One-to-Many via `Ratings`


