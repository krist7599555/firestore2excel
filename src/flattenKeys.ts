import * as _ from 'lodash';
import * as FP from 'lodash/fp';

const EMPTY_ARRAY = "EMPTY_ARRAY"
const EMPTY_OBJECT = "EMPTY_OBJECT"

export function flattenKeys(o: any, path: string[] = []): any {
  if (_.isObject(o) && _.isEmpty(o)) {
    // console.warn('object should not be empty')
    return { [path.join('.').replace(/.\[/g, '[')]: null }
  }
  if (_.isObject(o) && !_.isEmpty(o)) {
    if (_.isEmpty(o)) throw new Error("flattenKeys value can not be empty");
    return _.reduce(o, (res, val, key) => _.merge(res, flattenKeys(val, [...path, _.isArray(o) ? `[${key}]` : key])), {});
  } else {
    const key = path.join('.').replace(/.\[/g, '[');
    return { [key]: o }
  }
}

export function unflattenKeys(o: any) {
  const is_array = _.every(_.keys(o).map(k => _.startsWith(k, '[')));
  return _.reduce(_.toPairs(o), (cum: any, [path, val]: any) => {
    _.set(cum, path, val);
    return cum
  }, is_array ? [] : {});
}

function test() {
  const case1 = [{a:7}, null, [[5, {d: null, e: [1, "23"]}]]];
  const case2 = { a: 13, b: { c: 7, d: [8,9] } }
  const case3 = [{}]
  const case4 = {}
  const case5 = [] as any
  console.log(flattenKeys(case3))
  console.log(flattenKeys(case4))
  console.log(flattenKeys(case5))
}
// test();