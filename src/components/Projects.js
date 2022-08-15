import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import { ProjectCard } from "./ProjectCard";
import projImg1 from "../assets/img/project-img1.png";
import projImg2 from "../assets/img/project-img2.png";
import projImg3 from "../assets/img/project-img3.png";
import TSLAImg from "../assets/img/TSLAPredictions.PNG";
import CNNImg from "../assets/img/CNNPredictions.PNG";
import STImg from "../assets/img/ST.PNG";
import colorSharp2 from "../assets/img/color-sharp2.png";
import 'animate.css';
import TrackVisibility from 'react-on-screen';

export const Projects = () => {

  return (
    <section className="projects" id="projects">
      <Container>
        <Row>
          <Col size={12}>
            <TrackVisibility>
              {({ isVisible }) =>
              <div className={isVisible ? "animate__animated animate__fadeIn": ""}>
                <h2>Projects</h2>
                <Tab.Container id="projects-tabs" defaultActiveKey="first">
                  <Nav variant="pills" className="nav-pills mb-5 justify-content-center align-items-center" id="pills-tab">
                    <Nav.Item>
                      <Nav.Link eventKey="first">Tesla Close Price Predictor</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="second">Breast Cancer Cell Identifier</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="third">Segment Tree Visualizer</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="fourth">Old Website</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content id="slideInUp" className={isVisible ? "animate__animated animate__slideInUp" : ""}>
                    <Tab.Pane eventKey="first">
                      <p>
                        Trained a Long Short-Term Memory (LSTM) Recurrent Neural Network to predict the TSLA stock's
                        close price.  
                        <br/><br/>
                        Used Jupyter Notebook, Python, Keras, and Tensorflow
                      </p>
                      <a href = "https://www.github.com/jackgao1540/LSTM_TSLA" target="_blank"><img src = {TSLAImg} id = "TSLAImg"></img></a>
                    </Tab.Pane>
                    <Tab.Pane eventKey="second">
                      <p>
                        Trained a Convolutional Neural Network to classify breast cancer cell types: MCF-7, MCF-10A, and MDA MB 231. 
                        <br/><br/>
                        Used Jupyter Notebook, Python, Keras, and Tensorflow. Generally followed <a href = "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6399327/">this paper</a>.
                      </p>
                      <a href = "https://github.com/jackgao1540/group4DeepLearningProject" target="_blank"><img src = {CNNImg} id = "CNNImg"></img></a>
                     
                    </Tab.Pane>
                    <Tab.Pane eventKey="third">
                      <p>Visualizer that generates a segment tree from array of integers.
                        <br/>
                        Implements Lazy Propagation.
                        <br/>
                        Used Javascript.
                      </p>
                      <a href = "https://github.com/jackgao1540/Segment-Tree-Visualisation-Lazy-Propagation-Javascript" target="_blank"><img src = {STImg} id = "STImg"></img></a>
                    </Tab.Pane>
                    <Tab.Pane eventKey="fourth">
                      <p>My old <a href = "http://www.jackgao1540.com" target = "_blank">website</a>/portfolio, made in 2020.</p>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </div>}
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
      <img className="background-image-right" src={colorSharp2}></img>
    </section>
  )
}
