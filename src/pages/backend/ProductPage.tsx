
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select'
import PiSysTable from '../../components/PiSysTable'
import Config from '../../helpers/Config';
import OrbitLoader from '../../components/OrbitLoader';
import { SelectStyles } from "../../components/SelectColor";
import { useProductStore } from '../../utils/productStore';


const titles = "Products List";
const ITEMS_PER_PAGE_CARDS = 8;


// This is used to show success messages when a user performs an action like adding, updating or deleting a product This is a mixin for SweetAlert2 to create a toast notification It will show a small notification at the top right corner of the screen
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

const ProductPage = () => {

  const brandName = Config[0].BRAND_NAME;
  const baseUrl = Config[0].BASE_URL;
  const [selectedItems, setSelectedItems] = useState([]);
  const { setPageTitle } = useOutletContext();

  // TODO: This is the global state for the product page custom hook that uses Zustand to manage the state of the product page. It provides a way to access and update the state of the product page, It uses the useProductStore hook to get the state and actions, It uses the useEffect hook to fetch data from the API and update the state
  const {
    PRODUCT_LIST,
    PAGINATED_LIST,
    CATEGORY_LIST,
    FAVORITES,
    selectedCategory,
    display,
    isSaving,
    isLoading,
    searchTerm,
    debouncedSearchTerm,
    currentPage,
    filterCategory,

    setPRODUCT_LIST,
    setPAGINATED_LIST,
    setCATEGORY_LIST,
    toggleFavorite,
    setSelectedCategory,
    setDisplay,
    setIsSaving,
    setIsLoading,
    setSearchTerm,
    setDebouncedSearchTerm,
    setCurrentPage,
    setFilterCategory,
  } = useProductStore();


  // TODO: Set the page title dynamically
  useEffect(() => {
    setPageTitle(titles);
    Config[0].currentPage = titles;
    document.getElementById("pageTitle").innerHTML = Config[0].currentPage + Config[0].APP_TITLE;
  }, [setPageTitle]);


  // TODO:  Fetching Data from the api to show in the table
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/products`);
      const rawList = response.data;

      const filteredData = rawList
        .filter(item => typeof item === 'object' && !Array.isArray(item) && item.id)
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map((c, i) => ({
          tableRow: {
            ID: `PROD${(i + 1).toString().padStart(4, '00')}`,
            Name: c.name,
            Price: c.price,
            Category: c.category,
            Rating: c.rating,
          },
          originalId: c.id,
          originalDescription: c.description,
        }));

      setPRODUCT_LIST(filteredData);
      setPAGINATED_LIST(filteredData.slice(0, ITEMS_PER_PAGE_CARDS));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, setIsLoading, setPAGINATED_LIST, setPRODUCT_LIST]);


  // TODO: Getting the catgories for the dropdown from the api
  const fetchCategories = useCallback(() => {
    axios.get(`${baseUrl}/categories`)
      .then(res => {
        const options = res.data
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
          .map(c => ({
            label: c,
            value: c
          }));
        setCATEGORY_LIST(options);
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
      });
  }, [baseUrl, setCATEGORY_LIST]);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [fetchData, fetchCategories]);



  // TODO: CALLING THE MODAL TO CRATE NEW PRODUCT
  const createNewProduct = () => {
    const title = document.querySelector('.modal-title'); title && (title.innerText = "Adding New Product");
    document.getElementById('btn-edit').style.display = 'none';
    document.getElementById('btn-save').style.display = 'inline-block';
    window.bootstrap.Modal.getOrCreateInstance(document.getElementById('primary-header-modal')).show();
  };


  //TODO: This function will set the data back to the modal for update
  const getRecord2Edit = (record, id, des) => {

    const cat = CATEGORY_LIST.find(opt => opt.value === record.Category);
    console.log(cat);
    setSelectedCategory(cat)
    document.getElementById('gottenId').value = id;
    document.getElementById('name').value = record.Name;
    document.getElementById('price').value = record.Price;
    document.getElementById('description').value = des;

    document.getElementById('btn-edit').style.display = 'inline-block';
    document.getElementById('btn-save').style.display = 'none';

    const title = document.querySelector('.modal-title'); title && (title.innerText = "Modifying " + record.Name);
    window.bootstrap.Modal.getOrCreateInstance(document.getElementById('primary-header-modal')).show();
  };

  //TODO: This function will send the request direct to the database to delete
  const getRecord2Delete = (record, id) => {
    Swal.fire({
      title: "Confirm Action",
      html: `Are you sure you want to remove <strong>${record.Name}</strong> from the records ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      allowOutsideClick: false,
    }).then((result) => {
      if (!result.isConfirmed) return;

      setIsSaving(true);
      axios.delete(`${baseUrl}/products/${id}`)
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            Toast.fire({ icon: "success", title: `${record.Name} has been removed successfully.` }).then(fetchData);
          } else {
            Swal.fire({ icon: 'error', title: 'Failed!', text: 'Deletion failed. Please try again.' });
          }
        })
        .catch(err => {
          const msg = err?.response?.data?.message || err?.response?.data?.error || 'Request failed.';
          Swal.fire({ icon: 'error', title: 'Error!', text: msg });
        })
        .finally(() => setIsSaving(false));
    });
  };


  // TODO: This is set the record to view more
  const getRecord2View = (record, id, des) => {
    const cat = CATEGORY_LIST.find(opt => opt.value === record.Category);

    const htmlContent = `
      <div style="text-align: left; font-size: 14px; margin-top: -10px;">
        <hr class="custom-hr" />
        <p><strong>ID:</strong> <span>${record.ID}</span></p>
        <p><strong>Name:</strong> <span>${record.Name}</span></p>
        <p><strong>Category:</strong> <span>${cat ? cat.label : record.Category}</span></p>
        <p><strong>Price:</strong> <span>GHS ${record.Price}</span></p>
        <p><strong>Description:</strong> <span>${des}</span></p>
        <p><strong>Rating:</strong> <span>${record.Rating}</span></p>
      </div>
    `;
    Swal.fire({ title: `Viewing ${record.Name}`, html: htmlContent, allowOutsideClick: false });
  };


  // TODO: Send Saving request to the api
  const sendSaveRequest = () => {
    const name = document.getElementById('name').value.trim();
    let price = document.getElementById('price').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!name || !price || !selectedCategory) {
      Swal.fire({ icon: 'error', title: 'Attention Please!', text: 'Please fill all the fields and it is required', });
      return;
    }

    // Sanitize price input
    if (price.startsWith('.')) price = '0' + price;
    if (price.endsWith('.')) price = price + '00';

    // Disable the button and show loading indicator
    setIsSaving(true);

    const payload = {
      name,
      price,
      description,
      category: selectedCategory?.value,
      rating: "0.1"
    };

    // Send POST request to the API using axios
    axios.post(`${baseUrl}/products`, payload)
      .then(res => {
        const { status, data } = res;
        if ((status === 200 || status === 201) && data?.id) {
          window.bootstrap.Modal.getOrCreateInstance(document.getElementById('primary-header-modal')).hide();
          Toast.fire({ icon: "success", title: 'Operation performed successfully, product saved' }).then(() => { fetchData() });
        } else {
          Swal.fire({ icon: 'error', title: 'Request Failed!', text: 'Something went wrong. Please check your input or try again later.' });
        }
      })
      .catch(error => {
        // Network or unexpected server error
        const errorMessage = (error.response?.data?.message) || (error.response?.data?.error) || 'An error occurred while sending the request.';
        Swal.fire({ icon: 'error', title: 'Error Found!', text: errorMessage });
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  // TODO: Send Update request to the database
  const sendUpdateRequest = () => {
    const name = document.getElementById('name').value.trim();
    let price = document.getElementById('price').value.trim();
    const description = document.getElementById('description').value.trim();
    const id = document.getElementById('gottenId').value;

    if (!name || !price || !selectedCategory || !id) {
      Swal.fire({ icon: 'error', title: 'Attention Please!!', text: 'Please fill all the fields and it is required', });
      return;
    }

    // Sanitize price input
    if (price.startsWith('.')) price = '0' + price;
    if (price.endsWith('.')) price = price + '00';

    // Disable the button and show loading indicator
    setIsSaving(true);

    // Send POST request to the API using axios
    axios.put(`${baseUrl}/products/${id}`, { name, price, description, category: selectedCategory?.value, rating: "0.1" })
      .then(res => {
        const { status, data } = res;
        if ((status === 200 || status === 201) && data?.id) {
          window.bootstrap.Modal.getOrCreateInstance(document.getElementById('primary-header-modal')).hide();
          Toast.fire({ icon: "success", title: 'Operation performed successfully, product updated' }).then(() => { fetchData() });
        } else {
          Swal.fire({ icon: 'error', title: 'Request Failed!', text: 'Something went wrong. Please check your input or try again later.' });
        }
      })
      .catch(error => {
        // Network or unexpected server error
        const errorMessage = (error.response?.data?.message) || (error.response?.data?.error) || 'An error occurred while sending the request.';
        Swal.fire({ icon: 'error', title: 'Error Found!', text: errorMessage });
      })
      .finally(() => {
        setIsSaving(false);
      });
  }


  // TODO: DEBOUNCE LOGIC TO OPTIMIZE SEARCH
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // debounce delay
    return () => clearTimeout(handler);
  }, [searchTerm, setDebouncedSearchTerm]);

  // TODO: Filter the CARD list based on the search term
  const filteredList = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase();
    return PRODUCT_LIST.filter(p => {
      const name = p.tableRow.Name?.toLowerCase() || '';
      const category = p.tableRow.Category?.toLowerCase() || '';
      const description = p.originalDescription?.toLowerCase() || '';
      const rating = String(p.tableRow.Rating || '').toLowerCase();
      const price = String(p.tableRow.Price || '').toLowerCase();

      return (
        name.includes(term) ||
        category.includes(term) ||
        description.includes(term) ||
        rating.includes(term) ||
        price.includes(term)
      );
    });
  }, [debouncedSearchTerm, PRODUCT_LIST]);


  // TODO: Filter the TABLE based on selected category
  const FILTERED_PRODUCT_LIST = useMemo(() => {
    if (!filterCategory) return PRODUCT_LIST;
    return PRODUCT_LIST.filter(p => p.tableRow.Category === filterCategory.value);
  }, [PRODUCT_LIST, filterCategory]);


  // TODO: Set the paginated list based on the current page and filtered list
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE_CARDS);

  // Set the paginated list based on the current page and filtered list, This effect runs whenever the filtered list, current page, or setPAGINATED_LIST changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_CARDS;
    const endIndex = startIndex + ITEMS_PER_PAGE_CARDS;
    setPAGINATED_LIST(filteredList.slice(startIndex, endIndex));
  }, [filteredList, currentPage, setPAGINATED_LIST]);


  // Handle page change pagination This function is called when the user clicks on a page number It checks if the page number is within the valid range and then sets the current page also It checks if the page number is within the valid range and then sets the current page
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle previous page pagination This function is called when the user clicks on the previous page button It checks if the current page is greater than 1, and if so, it calls the handlePageChange function with the current page minus 1
  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Handle next page pagination This function is called when the user clicks on the next page button
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Handle display type toggle. This function is called when the user clicks on the grid or card button to change the display type
  const handleDisplayToggle = (p) => {
    const newDisplayType = p.currentTarget.dataset.viewtype;
    if (newDisplayType === 'card' || newDisplayType === 'grid') {
      setDisplay(newDisplayType);
      document.getElementById('isearch').style.display = newDisplayType === "card" ? 'inline-block' : 'none';
    }
  };

  // handles the selected items from the table. This function is called when the user selects items from the table
  const handleItemSelectedFromTable = useCallback((selectedRows) => {
    if (selectedRows.length > 0) {
      const originalIds = FILTERED_PRODUCT_LIST.filter(item =>
        selectedRows.some(selectedRow => selectedRow.ID === item.tableRow.ID)
      ).map(item => item.originalId);
      setSelectedItems(originalIds);
    } else {
      setSelectedItems([]);
    }
  }, [setSelectedItems, FILTERED_PRODUCT_LIST]);

  // TODO: Handler function for bulk marking as favorite
  const handleBulkMarkFavorite = () => {
    if (selectedItems.length === 0) {
      Toast.fire({ icon: 'warning', title: 'No items selected.' });
      return;
    }

    Swal.fire({
      title: 'Add to favorite',
      html: `Are you sure you want to mark <strong>${selectedItems.length}</strong> items as favorite?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, mark them!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        selectedItems.forEach((itemId) => {
          if (!FAVORITES.includes(itemId)) {
            toggleFavorite(itemId);
          }
        });
        Toast.fire({ icon: 'success', title: 'Selected items marked as favorite.' });
      }
    });
  };

  // TODO: Handler function for bulk unmarking as favorite
  const handleBulkUnmarkFavorite = () => {
    if (selectedItems.length === 0) {
      Toast.fire({ icon: 'warning', title: 'No items selected.' });
      return;
    }

    Swal.fire({
      title: 'UnAdd to favorite',
      html: `Are you sure you want to unmark <strong>${selectedItems.length}</strong> items as favorite?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove them!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        selectedItems.forEach((itemId) => {
          if (FAVORITES.includes(itemId)) {
            toggleFavorite(itemId);
          }
        });
        Toast.fire({ icon: 'success', title: 'Selected items removed from favorite.' });
      }
    });
  };


  // Handler function to toggle favorite and show toast
  const handleToggleFavorite = (productId, isCurrentlyFavorite) => {
    toggleFavorite(productId);
    Toast.fire({
      icon: 'success',
      title: isCurrentlyFavorite ? 'Product removed from favorites' : 'Product added to favorites',
    });
  };



  return (
    <div className="content">

      {/* Start Content*/}
      <div className="container-fluid">

        {/* start page title */}
        <div className="row">
          <div className="col-12">
            <div className="page-title-box" >
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="#">{brandName}</a></li>
                  <li className="breadcrumb-item"><a href="#">Products</a></li>
                  <li className="breadcrumb-item active">List</li>
                </ol>
              </div>
              <h4 className="page-title">{titles}</h4>
            </div>
          </div>
        </div>
        {/* end page title */}


        {/* grid and columns buttons */}
        <div className="col-sm-12 mb-3">
          <div className="text-sm-end ">
            <div data-viewtype="grid" onClick={handleDisplayToggle} onKeyDown={(e) => e.key === 'Enter' && handleDisplayToggle(e)} className="btn-group text-end">
              <button type="button" className={`btn ${display === 'grid' ? 'btn-dark' : 'btn-link text-dark'}`}><i className="mdi mdi-format-list-bulleted-type" /></button>
            </div>
            <div data-viewtype="card" onClick={handleDisplayToggle} onKeyDown={(e) => e.key === 'Enter' && handleDisplayToggle(e)} className="btn-group text-end">
              <button type="button" className={`btn ${display === 'card' ? 'btn-dark' : 'btn-link text-dark'}`}><i className="mdi mdi-apps" /></button>
            </div>
          </div>
        </div>


        <div className="row">
          <div className="col-12">

            {isLoading ? (
              <OrbitLoader />
            ) : (
              <>

                {/* Griding and Card view */}
                <div className={`row ${display === 'grid' ? 'd-none' : ''}`}>

                  <div className="col-md-12 col-sm-6 mb-3" id="isearch">
                    <input type="text" className="form-control" placeholder="Search..." value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }} />
                  </div>

                  {PAGINATED_LIST.map(p => {
                    const isFav = FAVORITES.includes(p.originalId);
                    return (
                      <div className="col-lg-3" key={p.originalId}>
                        <div className="card project-box card-shadow ribbon-box">
                          <div className="card-body mt-2">

                            <div className="dropdown float-end">
                              <a href="#" className="dropdown-toggle card-drop arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="mdi mdi-dots-horizontal m-0 text-muted h3" />
                              </a>
                              <div className="dropdown-menu dropdown-menu-end">
                                <button className='dropdown-item'>
                                  <i className="mdi mdi-eye-outline me-2"></i> View More Details
                                </button>
                                <button className='dropdown-item' onClick={() => handleToggleFavorite(p.originalId, isFav)}>
                                  <i className={`mdi ${isFav ? 'mdi-star-off-outline' : 'mdi-star-check-outline'} me-2`}></i>
                                  {isFav ? 'Remove from favorite' : 'Add to favorite'}
                                </button>
                                <button className='dropdown-item' onClick={() => p?.tableRow && getRecord2Edit(p.tableRow, p.originalId, p.originalDescription)} >
                                  <i className="mdi mdi-draw-pen me-2"></i> Edit Product
                                </button>
                                <button className='dropdown-item text-danger' onClick={() => p?.tableRow && getRecord2Delete(p.tableRow, p.originalId)} >
                                  <i className="mdi mdi-delete-outline me-2"></i> Remove Product
                                </button>
                              </div>
                            </div>

                            <h4 className="mt-1 event-title text-dark two-line-ellipsis">{p.tableRow.Name} {isFav && <i className="mdi mdi-star text-warning ms-1"></i>}</h4>
                            <div>
                              <p className="text-muted mb-1 font-13"><strong>Rating:</strong> <span className="ms-1 badge me-2 bg-soft-success text-success">{p.tableRow.Rating}</span></p>
                            </div>
                            <hr />
                            <p className="text-muted mb-1 font-13"><span>Category:</span><strong className="ms-1 text-uppercase">{p.tableRow.Category}</strong></p>
                            <p className="text-muted mb-1 font-13"><strong>Price:</strong> <span className="ms-1 badge me-2 bg-soft-danger text-danger">GHS{p.tableRow.Price}</span></p>
                            <p className="text-muted mb-1 font-13"><strong>Description:</strong> <span className="ms-1">{p.originalDescription}</span></p>
                          </div>
                        </div>
                      </div>
                    );
                  })}


                  {/* Pagination Controls for Card View */}
                  {totalPages > 1 && (
                    <div className="col-12 mt-3 d-flex justify-content-center">
                      <nav>
                        <ul className="pagination pagination-rounded mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <a className="page-link" href="#" aria-label="Previous" onClick={handlePrevPage}>
                              <span aria-hidden="true">«</span>
                            </a>
                          </li>
                          {Array.from({ length: totalPages }, (_, index) => (
                            <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                              <a className="page-link" href="#" onClick={() => handlePageChange(index + 1)}>
                                {index + 1}
                              </a>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <a className="page-link" href="#" aria-label="Next" onClick={handleNextPage}>
                              <span aria-hidden="true">»</span>
                            </a>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>

                {/* start of table */}
                <div className={`${display === 'card' ? 'd-none' : ''}`}>

                  {/* table header or card header */}
                  <div className="card-header flex-wrap row gx-1 gy-1 mb-3 align-items-center">
                    <div className="col-auto">
                      <button className="btn btn-primary" onClick={createNewProduct}>
                        <i className="fe-plus"></i> Add New
                      </button>
                    </div>

                    <div className="col-auto">
                      <button className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
                        <i className="mdi mdi-refresh me-1"></i> Refresh
                      </button>
                    </div>

                    {selectedItems.length > 0 && (
                      <div className="col-auto">
                        <div className="dropdown">
                          <button className="btn btn-info dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            Bulk Actions
                          </button>
                          <div className="dropdown-menu dropdown-menu-end">
                            <button className="dropdown-item" onClick={handleBulkMarkFavorite}><i className="mdi mdi-star-check-outline me-2"></i> Add to favorite</button>
                            <button className="dropdown-item" onClick={handleBulkUnmarkFavorite}><i className="mdi mdi-star-off-outline me-2"></i> Remove from favorite</button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="col-md-4 col-sm-6">
                      <Select placeholder="Filter by Category" options={CATEGORY_LIST} value={filterCategory} onChange={(option) => setFilterCategory(option)} styles={SelectStyles} isClearable />
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="card-body">
                    <h4 className="header-title">The table below shows the list of all available products in the system. You can add, edit, delete, Add to favorite or Remove from favorite any product from this list. </h4>
                    <hr />

                    <PiSysTable
                      data={FILTERED_PRODUCT_LIST.map(item => item.tableRow)}
                      selectable={true} idField="ID" renderAsHTML={true}
                      showExportButtons={['excel', 'csv', 'print']}
                      onSelectionChange={handleItemSelectedFromTable}
                      actions={(record) => {
                        // Get the current product ID and original ID This is used to get the current product ID and original ID from the record
                        const currentCustomId = record.ID;
                        const currentProduct = FILTERED_PRODUCT_LIST.find(item => item.tableRow.ID === currentCustomId);
                        const originalId = currentProduct?.originalId;
                        const des = currentProduct?.originalDescription;
                        const isFav = originalId && FAVORITES.includes(originalId);

                        return (
                          <div className="d-flex align-items-center justify-content-center">
                            {isFav && <i className="mdi mdi-star text-warning me-2"></i>}
                            <div className="dropdown">
                              <a href="#" className="dropdown-toggle arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="mdi mdi-dots-horizontal m-0 text-muted h3" />
                              </a>
                              <div className="dropdown-menu dropdown-menu-end">
                                <button className='dropdown-item' onClick={() => getRecord2View(record, originalId, des)}>
                                  <i className="mdi mdi-eye-outline me-2"></i> View More Details
                                </button>
                                <button className='dropdown-item' onClick={() => handleToggleFavorite(originalId, isFav)}>
                                  <i className={`mdi ${isFav ? 'mdi-star-off-outline' : 'mdi-star-check-outline'} me-2`}></i>
                                  {isFav ? 'Remove from favorite' : 'Add to favorite'}
                                </button>
                                <button className='dropdown-item' onClick={() => getRecord2Edit(record, originalId, des)}>
                                  <i className="mdi mdi-draw-pen me-2"></i> Edit Product
                                </button>
                                <button className='dropdown-item text-danger' onClick={() => getRecord2Delete(record, originalId)}>
                                  <i className="mdi mdi-delete-outline me-2"></i> Remove Product
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />

                  </div>
                </div>
                {/* end of table */}

              </>
            )}
          </div>
        </div>

        {/* Modal for adding new and editing records */}
        <div id="primary-header-modal" className="modal fade" role="dialog" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="primary-header-modalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header bg-primary">
                <img src="/assets/images/logo-white.png" height={20} style={{ opacity: 0.9, marginRight: 20 }} />
                <h4 className="modal-title" id="primary-header-modalLabel">Modal Heading</h4>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-hidden="true" />
              </div>
              <div className="modal-body">
                <div className='row'>

                  <input type="hidden" id='gottenId' />

                  <div className="mb-2">
                    <label htmlFor="category" className="form-label">Assign product a catogory</label>
                    <Select id="category" options={CATEGORY_LIST} value={selectedCategory} onChange={(option) => setSelectedCategory(option)} styles={SelectStyles} isClearable />
                  </div>

                  <div className="mb-2">
                    <label htmlFor="name" className="form-label">Product name or label</label>
                    <input id='name' type="text" className="form-control" required />
                  </div>

                  <div className="mb-1">
                    <label htmlFor="price" className="form-label">Price per unit of product</label>
                    <input id='price' type="text" className="form-control" maxLength={6} onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9.]/g, '').replace(/\..*\./g, '.');
                    }} required />
                  </div>

                  <div className="mb-1">
                    <label htmlFor="description" className="form-label">Product descriptions</label>
                    <textarea name='description' className="form-control" id="description" />
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-danger">Clear Fields</button>
                    <button type="button" className="btn btn-primary" id='btn-save' onClick={sendSaveRequest} disabled={isSaving}>
                      {isSaving ? <><i className="mdi mdi-atom-variant mdi-spin"></i> Sending Request...</> : <>Save Product</>}
                    </button>
                    <button type="button" className="btn btn-primary" id='btn-edit' onClick={sendUpdateRequest} disabled={isSaving}>
                      {isSaving ? <><i className="mdi mdi-atom-variant mdi-spin"></i> Sending Request...</> : <>Modify Product</>}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default ProductPage