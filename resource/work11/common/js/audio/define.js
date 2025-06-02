/**
 * @constant {number} DEFAULT_SPEED - 미디어 플레이어의 기본 재생 속도
 */
const DEFAULT_SPEED = 1.0;

/**
 * @constant {Array<number>} SPEED_SET - 사용 가능한 재생 속도 목록
 */
const SPEED_SET = [0.5, 0.75, 1.0, 1.5, 2.0];

/**
 * @readonly
 * @enum {number} MediaType - 미디어 타입 정의
 * @property {number} NONE - 지정되지 않은 타입
 * @property {number} AUDIO - 오디오 타입
 * @property {number} VIDEO - 비디오 타입
 */
const MediaType = {
	NONE: 1,
	AUDIO: 2,
	VIDEO: 3,
};

/**
 * @description 언어 타입 열거형
 * @enum {string}
 */
const Language = {
    NONE: 'none',
    KOREAN: 'kr',
    ENGLISH: 'en',
    ALL: 'all',
};

/**
 * @description 화자 타입 열거형
 * @enum {string}
 */
const Speaker = {
    NONE: 'none',
    ALL: 'all',
};

/**
 * @description 스크립트 타입 열거형
 * @enum {number}
 */
const ScriptType = {
    NONE: 0,
    DEFAULT: 1,
    PROMPT: 2,
};