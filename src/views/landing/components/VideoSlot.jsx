import Icon from '@/components/wrappers/Icon'
import { Col, Container, Row } from 'react-bootstrap'
import MotionSection from './MotionSection'

const VideoSlot = () => {
  return (
    <MotionSection className="section-custom velorak-section velorak-section--muted" id="video">
      <Container>
        <Row className="mb-4">
          <Col lg={8}>
            <h2 className="velorak-section__title mb-3">See Velorak in motion</h2>
            <p className="velorak-section__lead mb-0">Product walkthrough video goes here when you are ready.</p>
          </Col>
        </Row>

        <div className="velorak-media-frame">
          <div className="velorak-media-slot velorak-media-slot--video" role="img" aria-label="Product video placeholder">
            <div className="velorak-media-slot__inner">
              <span className="velorak-play">
                <Icon icon="play" className="fs-3" />
              </span>
              <p className="fw-semibold mb-1 mt-3">Drop product video here</p>
              <p className="small mb-0 opacity-75">Replace this block with your embed or mp4 under src/assets/images/landing/</p>
            </div>
          </div>
        </div>
      </Container>
    </MotionSection>
  )
}

export default VideoSlot
