import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Eye, Edit2, Trash2, X, Upload, Users, UserPlus, Trash } from 'lucide-react';

const RationCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Form State for Adding/Editing
  const [formData, setFormData] = useState({
    holderName: '',
    aadhaar: '',
    phone: '',
    address: '',
    branch: '',
    members: [] // Backend expects array of {name, age, relation}
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- 1. Fetch Data ---
  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/ration-cards', config);
      setCards(res.data.data || []); 
      setLoading(false);
    } catch (err) {
      console.error("Error fetching cards", err);
      setLoading(false);
    }
  };

  // --- 2. Handlers ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send formData including the members array
      await axios.post('http://localhost:5000/api/admin/ration-cards', formData, config);
      setShowAddModal(false);
      // Reset form
      setFormData({ holderName: '', aadhaar: '', phone: '', address: '', branch: '', members: [] });
      fetchCards(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add card");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/ration-cards/${id}`, config);
        fetchCards();
      } catch (err) {
        alert(err.response?.data?.message || "Delete failed");
      }
    }
  };

  // Dynamic Family Member Handlers
  const addMemberField = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { name: '', age: '', relation: '' }]
    });
  };

  const removeMemberField = (index) => {
    const updatedMembers = formData.members.filter((_, i) => i !== index);
    setFormData({ ...formData, members: updatedMembers });
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index][field] = value;
    setFormData({ ...formData, members: updatedMembers });
  };

  const handleView = (card) => {
    setSelectedCard(card);
    setShowViewModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowAddModal(false);
    setSelectedCard(null);
  };

  // Filter cards based on search input
  const filteredCards = cards.filter(card => 
    card.holderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.rationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.aadhaar?.includes(searchTerm)
  );

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Ration Card Management</h4>
          <p className="text-muted small mb-0">Manage all registered ration card holders</p>
        </div>
        <button className="btn btn-success d-flex align-items-center gap-2" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add New Card
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded shadow-sm mb-4 d-flex align-items-center border">
        <Search size={20} className="text-muted me-3" />
        <input 
          type="text" 
          className="form-control border-0 shadow-none" 
          placeholder="Search by name, ration number, or Aadhaar..." 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-4">Ration Card No.</th>
                <th className="py-3">Aadhaar</th>
                <th className="py-3">Holder Name</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Family</th>
                <th className="py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
              ) : filteredCards.map((card) => (
                <tr key={card._id}>
                  <td className="ps-4 text-success fw-medium small">{card.rationNumber}</td>
                  <td className="text-muted small">{card.aadhaar}</td>
                  <td className="fw-medium small">{card.holderName}</td>
                  <td className="text-muted small">{card.phone}</td>
                  <td className="small">
                    <div className="d-flex align-items-center gap-1 text-secondary">
                      <Users size={14} /> <span>{card.familyCount || 1}</span>
                    </div>
                  </td>
                  <td className="text-end pe-4">
                    <button className="btn btn-light btn-sm me-2 text-secondary" onClick={() => handleView(card)}><Eye size={16} /></button>
                    <button className="btn btn-light btn-sm text-danger" onClick={() => handleDelete(card._id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: View Details */}
      {showViewModal && selectedCard && (
        <ModalOverlay onClose={closeModals} title="Ration Card Details">
          <div className="row g-3">
            <DetailRow label="Ration Card No." value={selectedCard.rationNumber} />
            <DetailRow label="Aadhaar" value={selectedCard.aadhaar} />
            <DetailRow label="Holder Name" value={selectedCard.holderName} />
            <DetailRow label="Phone" value={selectedCard.phone} />
            <DetailRow label="Branch" value={selectedCard.branch} />
            <div className="col-12 mt-3">
              <label className="text-muted small d-block mb-1">Address</label>
              <div className="fw-medium small">{selectedCard.address}</div>
            </div>
            <div className="col-12 mt-4">
              <h6 className="fw-bold small border-bottom pb-2 mb-3">Family Members ({selectedCard.familyCount})</h6>
              <ul className="list-unstyled small ps-2">
                 <li className="mb-2 text-success fw-bold">• {selectedCard.holderName} (Head)</li>
                 {selectedCard.members?.map((m, i) => (
                   <li key={i} className="mb-2 text-muted">• {m.name} ({m.relation}) - {m.age} yrs</li>
                 ))}
              </ul>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* MODAL: Add New Card */}
      {showAddModal && (
        <ModalOverlay onClose={closeModals} title="Add New Ration Card">
          <form onSubmit={handleAddSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Aadhaar Number *</label>
                <input required type="text" className="form-control form-control-sm" placeholder="XXXX-XXXX-XXXX" 
                  onChange={(e) => setFormData({...formData, aadhaar: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Holder Name *</label>
                <input required type="text" className="form-control form-control-sm" placeholder="Enter full name" 
                  onChange={(e) => setFormData({...formData, holderName: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Phone Number *</label>
                <input required type="text" className="form-control form-control-sm" placeholder="+91 XXXXX XXXXX" 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Branch *</label>
                <input type="text" className="form-control form-control-sm" placeholder="FPS Branch Name" 
                  onChange={(e) => setFormData({...formData, branch: e.target.value})} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Address *</label>
                <textarea required className="form-control form-control-sm" rows="2" placeholder="Enter complete address" 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
              </div>

              {/* Dynamic Family Members Section */}
              <div className="col-12 mt-3">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                  <h6 className="fw-bold small mb-0">Family Members</h6>
                  <button type="button" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={addMemberField}>
                    <UserPlus size={14} /> Add Member
                  </button>
                </div>
                {formData.members.map((member, index) => (
                  <div key={index} className="row g-2 mb-2 align-items-end bg-light p-2 rounded">
                    <div className="col-md-4">
                      <input required type="text" className="form-control form-control-sm" placeholder="Name" 
                        value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <input required type="text" className="form-control form-control-sm" placeholder="Relation" 
                        value={member.relation} onChange={(e) => handleMemberChange(index, 'relation', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <input required type="number" className="form-control form-control-sm" placeholder="Age" 
                        value={member.age} onChange={(e) => handleMemberChange(index, 'age', e.target.value)} />
                    </div>
                    <div className="col-md-2 text-end">
                      <button type="button" className="btn btn-link text-danger p-0" onClick={() => removeMemberField(index)}>
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-12 text-end mt-4">
                <button type="button" className="btn btn-light btn-sm me-2" onClick={closeModals}>Cancel</button>
                <button type="submit" className="btn btn-success btn-sm px-4">Add Ration Card</button>
              </div>
            </div>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
};

// Reusable Helper Components
const ModalOverlay = ({ title, children, onClose }) => (
  <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
    <div className="bg-white rounded shadow-lg p-0" style={{ width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom sticky-top bg-white">
        <h5 className="mb-0 fw-bold">{title}</h5>
        <button className="btn btn-link text-dark p-0" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="col-md-6 mb-2">
    <label className="text-muted small d-block mb-1">{label}</label>
    <div className="fw-medium small border-bottom pb-1">{value || 'N/A'}</div>
  </div>
);

export default RationCards;