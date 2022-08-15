import meter1 from "../assets/img/meter1.svg";
import meter2 from "../assets/img/meter2.svg";
import meter3 from "../assets/img/meter3.svg";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import arrow1 from "../assets/img/arrow1.svg";
import arrow2 from "../assets/img/arrow2.svg";
import colorSharp from "../assets/img/color-sharp.png"

export const Skills = () => {
  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  return (
    <section className="skill" id="skills">
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="skill-bx wow zoomIn">
                        <h2>Skills</h2>
                        <p>Some are courses that I've taken, others are things I am learning on my own.</p>
                        <table>
                          <tr>
                            <th>Skill</th>
                            <th>Experience</th>
                          </tr>
                          <tr>
                            <td>C++</td>
                            <td>5+ years of contest programming using online judges</td>
                          </tr>
                          <tr>
                            <td>Java</td>
                            <td>Coding projects in classes (CPSC 210 at UBC)</td>
                          </tr>
                          <tr>
                            <td>Python</td>
                            <td>Machine Learning projects (Tensorflow, Jupyter, Keras)</td>
                          </tr>
                          <tr>
                            <td>Calculus III, IV</td>
                            <td>MATH 200 and MATH 317 at UBC (4.03 GPA)</td>
                          </tr>
                          <tr>
                            <td>Linear Algebra</td>
                            <td>MATH 221 at UBC</td>
                          </tr>
                          <tr>
                            <td>Data Science</td>
                            <td>DSCI 100 at UBC (using R)</td>
                          </tr>
                          <tr>
                            <td>Algorithms and Data Structures</td>
                            <td>Trees, Dynamic Programming, Geometric and Graph Algorithms</td>
                          </tr>
                          <tr>
                            <td>Deep Learning</td>
                            <td>Convolutional Neural Networks, Recurrent Neural Networks using Python</td>
                          </tr>
                      </table>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}
