/** bagian awal */
const { nanoid } = require('nanoid');
const books = require('./books');

/** Handler Buku pembuatan buku baru , request ke Hapi */
const addBookHandler = (request, happi) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  /** kode 400 karena eror */
  if (name === undefined) {
    const response = happi.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = happi.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  /** bagian untuk pembuatan buku baru , menggunakan nanoid dengan length 18  */
  const id = nanoid(18);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = readPage === pageCount;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  /** bagian saat sukses, respon kode 201 */
  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    const response = happi.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  /** bagian saat gagal, respon kode 500 */
  const response = happi.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

/** Handler Buku dengan untuk menghapus buku, index pada rak (shelf) */
const deleteBookByIdHandler = (request, happi) => {
  const { bookId } = request.params;
  const index = books.findIndex((shelf) => shelf.id === bookId);

  /** jika buku berhasil dihapus, respon kode 200 */
  if (index !== -1) {
    books.splice(index, 1);
    const response = happi.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  /** jika buku gagal dihapus, respon kode 404 */
  const response = happi.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

/** Handler Buku dengan fungsi get by ID nya */
const getBookByIdHandler = (request, happi) => {
  const { bookId } = request.params;
  const book = books.filter((shelf) => shelf.id === bookId)[0];

  /** jika buku ditemukan kode 200 */
  if (book) {
    const response = happi.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }

  /** jika buku tak ada,  dengan respon koe 404 */
  const response = happi.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

/** Handler Buku dengan fungsi get all dan filtering dengan kode 200 */
const getAllBooksHandler = (request, happi) => {
  const { name, reading, finished } = request.query;
  if (!name && !reading && !finished) {
    const response = happi.response({
      status: 'success',
      data: {
        books: books.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  /** pengecekan nama */
  if (name) {
    const filteredBooksName = books.filter((book) => {
      const nameRegex = new RegExp(name, 'gi');
      return nameRegex.test(book.name);
    });
    const response = happi.response({
      status: 'success',
      data: {
        books: filteredBooksName.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  /** pengecekan reading */
  if (reading) {
    const filteredBooksReading = books.filter(
      (book) => Number(book.reading) === Number(reading),
    );
    const response = happi.response({
      status: 'success',
      data: {
        books: filteredBooksReading.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  /** pengecekan untuk finish */
  const filteredBooksFinished = books.filter(
    (book) => Number(book.finished) === Number(finished),
  );

  const response = happi.response({
    status: 'success',
    data: {
      books: filteredBooksFinished.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response;
};

/** Handler untuk edit buku saat sukses 200 */
const editBookByIdHandler = (request, happi) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  /** jika nama kosong akan 400 */
  if (!name) {
    const response = happi.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  /** jika nama halaman terbaca(read page) lebih besar dari total halaman(page count) kode 400 */
  if (readPage > pageCount) {
    const response = happi.response({
      status: 'fail',
      message:
          'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  /** Kategori finish bila page count= read page */
  const finished = pageCount === readPage;

  /** perbaharuan tanggal berdasar fungsi newdate */
  const updatedAt = new Date().toISOString();

  /** index berdasar fungsi find index */
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt,
    };

    /** konfirmasi berhasil kode 200 */
    const response = happi.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  /** konfirmasi gagal diperbarui harena tak ada , kode404 */
  const response = happi.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

/** bagian untuk export semua handler */
module.exports = {
  addBookHandler,
  deleteBookByIdHandler,
  getBookByIdHandler,
  getAllBooksHandler,
  editBookByIdHandler,
};
