import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import qs from 'qs';
import { getExperimentApi, getMetricHistoryApi, getRunApi } from '../actions';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import NotFoundPage from './NotFoundPage';
import { MetricView } from './MetricView';
import { getUUID } from '../../common/utils/ActionUtils';
import MetricsPlotPanel from "./MetricsPlotPanel";

export class RunMetricsPageImpl extends Component {
  static propTypes = {
    runUuids: PropTypes.arrayOf(String).isRequired,
    metricKey: PropTypes.string.isRequired,
    experimentId: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.requestIds = [];
    if (this.props.experimentId !== null) {
      const experimentRequestId = getUUID();
      this.props.dispatch(getExperimentApi(this.props.experimentId, experimentRequestId));
      this.requestIds.push(experimentRequestId);
    }
    this.props.runUuids.forEach((runUuid) => {
      const getMetricHistoryReqId = getUUID();
      this.requestIds.push(getMetricHistoryReqId);
      this.props.dispatch(
        getMetricHistoryApi(runUuid, this.props.metricKey, getMetricHistoryReqId),
      );
      // Fetch tags for each run. TODO: it'd be nice if we could just fetch the tags directly
      const getRunRequestId = getUUID();
      this.requestIds.push(getRunRequestId);
      this.props.dispatch(getRunApi(runUuid, getRunRequestId));
    });
  }

  renderPageContent() {
    const { runUuids, experimentId, metricKey } = this.props;
  return runUuids.length >= 1 ? (
      <MetricsPlotPanel {...{ experimentId, runUuids, metricKey }} />
    ) : (
      <NotFoundPage />
    );
  }

  render() {
    return (
      <div className='App-content'>
        <RequestStateWrapper requestIds={this.requestIds}>
          {this.renderPageContent()}
        </RequestStateWrapper>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { match } = ownProps;
  const runUuids = [match.params.runUuid];
  const experimentId = match.params.experimentId;
  const metricKey = 'val_top1';
  return {
    runUuids,
    metricKey,
    experimentId,
  };
};

export const RunMetricsPage = connect(mapStateToProps)(RunMetricsPageImpl);
