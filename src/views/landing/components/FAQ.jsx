import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Col, Container, Row } from 'react-bootstrap'
import { faqData } from './data'
import MotionSection from './MotionSection'

const FAQ = () => {
  return (
    <MotionSection className="section-custom velorak-section" id="faq">
      <Container>
        <Row className="mb-4 mb-lg-5">
          <Col lg={8}>
            <h2 className="velorak-section__title mb-3">Questions companies ask first</h2>
            <p className="velorak-section__lead mb-0">Straight answers about seats, invites, and plan activation.</p>
          </Col>
        </Row>

        <Row>
          <Col lg={10} xl={9}>
            <Accordion defaultActiveKey="0" className="velorak-faq">
              {faqData.map((item, index) => (
                <AccordionItem eventKey={String(index)} key={item.question}>
                  <AccordionHeader>{item.question}</AccordionHeader>
                  <AccordionBody>{item.answer}</AccordionBody>
                </AccordionItem>
              ))}
            </Accordion>
          </Col>
        </Row>
      </Container>
    </MotionSection>
  )
}

export default FAQ
