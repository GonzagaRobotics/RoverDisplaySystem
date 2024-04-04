/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message } from 'roslib';
import type { RosMapping } from '../RosMapping';

export enum AutoNavState {
	Disabled,
	Waiting,
	Planning,
	Moving,
	Terminal,
	Success
}

export enum AutoNavTargetType {
	GeoPoint,
	Post,
	Mallet,
	WaterBottle,
	Null
}

export enum AutoNavInstruction {
	Pause,
	Resume,
	Terminate,
	Execute
}

export type GeoPoint = {
	latitude: number;
	longitude: number;
};

export type Target = {
	location: GeoPoint;
	type: AutoNavTargetType;
};

export type Plan = {
	target: Target;
	waypoints: GeoPoint[];
};

export const StateMapping: RosMapping<{ state: AutoNavState }> = {
	state: {
		name: '/auto_nav/state',
		type: 'auto_nav_msgs/State',
		msgToObj: (msg) => (msg as any).state as AutoNavState
	}
};

export const StateLoadingData: { state: AutoNavState } = {
	state: AutoNavState.Disabled
};

export const PlanMapping: RosMapping<{ plan: Plan }> = {
	plan: {
		name: '/auto_nav/plan',
		type: 'auto_nav_msgs/Plan',
		msgToObj: (msg) => {
			const obj = msg as any;

			return {
				target: {
					location: {
						latitude: obj.target.location.latitude,
						longitude: obj.target.location.longitude
					},
					type: obj.target.type.type as AutoNavTargetType
				},
				waypoints: obj.waypoints.map((waypoint: any) => ({
					latitude: waypoint.latitude,
					longitude: waypoint.longitude
				}))
			};
		}
	}
};

export const PlanLoadingData: { plan: Plan } = {
	plan: {
		target: {
			location: {
				latitude: 0,
				longitude: 0
			},
			type: AutoNavTargetType.Null
		},
		waypoints: []
	}
};

export const TargetMapping: RosMapping<{ target: Target }> = {
	target: {
		name: '/auto_nav/target',
		type: 'auto_nav_msgs/Target',
		objToMsg: (obj) => {
			const msg = new Message({
				location: {
					latitude: obj.location.latitude,
					longitude: obj.location.longitude
				},
				type: { type: obj.type as number }
			});

			return msg;
		}
	}
};

export const InstructionMapping: RosMapping<{ instruction: AutoNavInstruction }> = {
	instruction: {
		name: 'auto_nav/instruction',
		type: 'auto_nav_msgs/Instruction',
		objToMsg: (obj) => {
			return new Message({
				instruction: obj as number
			});
		}
	}
};
