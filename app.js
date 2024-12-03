import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './App.module.css';
import logo from './assets/Logo.png';

function App() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', address: '', director: '', description: '', event: '' });
  const [editingProject, setEditingProject] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); // Estado para projeto selecionado
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // Buscar projetos do backend
  useEffect(() => {
    axios.get('http://localhost:5000/projects')
      .then(response => {
        setProjects(response.data);
        setFilteredProjects(response.data);
      })
      .catch(error => console.error('Erro ao buscar:', error));
  }, []);

  const handleSearchChange = (e) => {
    const keyword = e.target.value;  // Obtém a palavra-chave da pesquisa
    setSearchKeyword(keyword);  // Atualiza o estado da palavra-chave
  
    // Faz a requisição GET para o backend com o parâmetro search na query string
    console.log(`Requisição para: http://localhost:5000/projects?search=${keyword}`);
    axios.get(`http://localhost:5000/projects?search=${keyword}`)
      .then(response => {
        setFilteredProjects(response.data);  // Atualiza os projetos filtrados com a resposta
      })
      .catch(error => console.error('Erro ao buscar projetos filtrados:', error));
  };  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddProject = () => { // Adiciona um projeto
    axios.post('http://localhost:5000/projects', newProject)
      .then(response => {
        const updatedProjects = [...projects, { ...newProject, _id: response.data }];
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);
        setNewProject({ name: '', address: '', director: '', description: '', event: '' });
        scrollToSection('projectList');
        setShowSuccessMessage(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);

      })
      .catch(error => console.error('Erro ao adicionar:', error));
  };

  const handleDeleteProject = (projectId) => { // Deleta um projeto
    axios.delete(`http://localhost:5000/projects/${projectId}`)
      .then(() => {
        const updatedProjects = projects.filter(project => project._id !== projectId);
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);
        if (selectedProject && selectedProject._id === projectId) setSelectedProject(null); // Fechar detalhes se excluído
      })
      .catch(error => console.error('Erro ao deletar:', error));
  };

  const handleEditProject = (project) => { 
    setEditingProject(project._id);
    setNewProject({ name: project.name, address: project.address, director: project.director, description: project.description, event: project.event });
    setSelectedProject(null); // Fechar detalhes ao iniciar edição
  };

  const handleUpdateProject = () => {
    axios.put(`http://localhost:5000/projects/${editingProject}`, newProject)
      .then(() => {
        const updatedProjects = projects.map(project =>
          project._id === editingProject ? { ...project, ...newProject } : project
        );
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);
        setEditingProject(null);
        setNewProject({ name: '', address: '', director: '', description: '', event: '' });
      })
      .catch(error => console.error('Erro ao atualizar projeto:', error));
  };

  const handleShowDetails = (project) => {
    setSelectedProject(project);
    setEditingProject(null); // Fechar edição ao exibir detalhes
  };

  const handleCloseDetails = () => setSelectedProject(null);

  const handleCloseUpdateProject = () => setEditingProject(null);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Barra de navegação */}
      <nav className={styles.navbar}>
      <div className={styles.navbarLogo}>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>
        <div className={styles.navbarButtons}>
          <button onClick={() => scrollToSection('projectList')} className={styles.navButton}>Avisos e Eventos</button>
          <button onClick={openModal} className={styles.navButton}>Adicionar Escola</button>
        </div>
      </nav>

      <div className={styles.banner}></div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Adicionar Informações</h2>
            <input
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              placeholder="Nome da Instituição"
            />
            <br />
            <input
              type="text"
              name="address"
              value={newProject.address}
              onChange={handleInputChange}
              placeholder="Endereço"
            />
            <br />
            <input
              type="text"
              name="director"
              value={newProject.director}
              onChange={handleInputChange}
              placeholder="Responsável"
            />
            <br />
            <input
              type="text"
              name="event"
              value={newProject.event}
              onChange={handleInputChange}
              placeholder="Evento"
            />
            <br />
            <input
              type="text"
              name="description"
              value={newProject.description}
              onChange={handleInputChange}
              placeholder="Descrição"
            />
            <br />
            <button onClick={handleAddProject}>Adicionar Escola</button>
            <button onClick={closeModal} className={styles.closeButton}>Fechar</button>
            {showSuccessMessage && (
              <div style={{ color: 'green', marginTop: '10px' }}>
                Adicionado com sucesso!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Campo de pesquisa */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchKeyword}
          onChange={handleSearchChange}
          placeholder="Buscar por escola ou evento."
          className={styles.searchInput}
        />
      </div>

      {/* Containers lado a lado */}
      <div className={styles.mainContainer}>
        {/* Lista de projetos */}
        <section id="projectList" className={styles.projectList}>
          <h2>Avisos e Eventos</h2>
          {filteredProjects.length === 0 ? (
            <p>Nenhuma escola encontrada.</p>
          ) : (
            <ul>
              {filteredProjects.map((project, index) => (
                <li key={index}>
                  <strong>{index + 1}. Nome:</strong> {project.name} <br />
                  <strong>Evento:</strong> {project.event}<br />
                  <button onClick={() => handleDeleteProject(project._id)} className={styles.actionButton}>Deletar</button>
                  <button onClick={() => handleEditProject(project)} className={styles.actionButton}>Editar</button>
                  <button onClick={() => handleShowDetails(project)} className={styles.actionButton}>Detalhes</button>
                  {editingProject === project._id && (
                    <div className={styles.editSection}>
                      <h3>Atualizar Escola</h3>
                      <input
                        type="text"
                        name="name"
                        value={newProject.name}
                        onChange={handleInputChange}
                        placeholder="Nome da Instituição"
                      />
                      <br />
                      <input
                        type="text"
                        name="address"
                        value={newProject.address}
                        onChange={handleInputChange}
                        placeholder="Endereço"
                      />
                      <br />
                      <input
                        type="text"
                        name="director"
                        value={newProject.director}
                        onChange={handleInputChange}
                        placeholder="Responsável"
                      />
                      <br />
                      <input
                        type="text"
                        name="event"
                        value={newProject.event}
                        onChange={handleInputChange}
                        placeholder="Evento"
                      />
                      <br />
                      <input
                        type="text"
                        name="description"
                        value={newProject.description}
                        onChange={handleInputChange}
                        placeholder="Detalhes"
                      />
                      <br />
                      <button onClick={handleUpdateProject}>Salvar Alterações</button>
                      <button onClick={handleCloseUpdateProject} className={styles.closeButton}>Fechar</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Detalhes do projeto */}
        {selectedProject && (
          <section className={styles.detailsContainer}>
            <h2>Detalhes</h2>
            <p><strong>Nome:</strong> {selectedProject.name}</p>
            <p><strong>Endereço:</strong>{selectedProject.address}</p>
            <p><strong>Responsável:</strong>{selectedProject.director}</p>
            <p><strong>Evento:</strong> {selectedProject.event}</p>
            <p><strong>Descrição:</strong> {selectedProject.description}</p>
            <button onClick={handleCloseDetails} className={styles.closeButton}>Fechar</button>
          </section>
        )}
      </div>

          <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2024 Centro de Escolas Públicas do Rio</p>
          <div className={styles.socialLinks}>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          </div>
        </div>
      </footer>
      
    </div>
  );
}

export default App;
