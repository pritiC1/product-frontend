import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductUploadForm = ({ onProductUploaded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    category: '',
    color: '',
    size: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);

  useEffect(() => {
    const checkUserStatus = () => {
      const user = JSON.parse(localStorage.getItem('user')); // Get user data from localStorage
      if (user) {
        setIsAuthenticated(true);  // User is authenticated
        setIsSuperUser(user.is_superuser);  // Check if user is a superuser
      }
    };
    checkUserStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Get the token from localStorage
    const userToken = localStorage.getItem('token');  // Retrieve token from localStorage

    if (!userToken) {
      setError('No authentication token found.');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/products/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,  // Pass the token in the header
          },
        }
      );
      setSuccess('Product uploaded successfully!');
      onProductUploaded(response.data);  // Pass new product data back to parent
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // Token expired, attempt to refresh it
        await refreshToken();
        handleSubmit(e);  // Retry after refreshing the token
      } else {
        setError('Error uploading product! Please check your input.');
      }
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/refresh/', {
        refresh: localStorage.getItem('refreshToken'),
      });
      localStorage.setItem('token', response.data.access);
    } catch (err) {
      setError('Session expired. Please log in again.');
      // Redirect to login or handle further as needed
    }
  };

  if (!isAuthenticated) {
    return <p>Please log in to upload products.</p>;
  }

  if (!isSuperUser) {
    return <p>You do not have permission to upload products.</p>;
  }

  return (
    <div className="product-upload-form">
      <h2>Upload Product</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
        />
        <input
          type="text"
          name="brand"
          placeholder="Brand"
          value={formData.brand}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        />
        <input
          type="text"
          name="color"
          placeholder="Color"
          value={formData.color}
          onChange={handleChange}
        />
        <input
          type="text"
          name="size"
          placeholder="Size"
          value={formData.size}
          onChange={handleChange}
        />
        <button type="submit">Upload Product</button>
      </form>
    </div>
  );
};

export default ProductUploadForm;
