import React, { useState, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import {
  IconButton,
  Container,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Input,
  TextField,
  Slider,
  Stack,
  Select,
  Link,
  MenuItem,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Stage, Layer, Rect, Image } from 'react-konva';
import useImage from 'use-image';

// 型エイリアスの定義
type SetValueFunction = (value: React.SetStateAction<number>) => void;

// センサーサイズのオプションを定義
const sensorSizes = [
  { label: '中判', width: 43.8, height: 32.9 },
  { label: '35mm フルサイズ', width: 36, height: 24 },
  { label: 'APS-C (SONY, Nikon)', width: 23.6, height: 15.8 },
  { label: 'APS-C (Canon)', width: 22.3, height: 14.9 },
  { label: 'マイクロフォーサーズ', width: 17.3, height: 13 },
  { label: '1型', width: 13.2, height: 8.8 },
  { label: '2/3型', width: 8.8, height: 6.8 },
  { label: '1/2.3型', width: 6.2, height: 4.6 },
  { label: '中判 - 縦', width: 32.9, height: 43.8 },
  { label: '35mm フルサイズ - 縦', width: 24, height: 36 },
  { label: 'APS-C (SONY, Nikon) - 縦', width: 15.8, height: 23.6 },
  { label: 'APS-C (Canon) - 縦', width: 14.9, height: 22.3 },
  { label: 'マイクロフォーサーズ - 縦', width: 13, height: 17.3 },
  { label: '1型 - 縦', width: 8.8, height: 13.2 },
  { label: '2/3型 - 縦', width: 6.8, height: 8.8 },
  { label: '1/2.3型 - 縦', width: 4.6, height: 6.2 },
];

// レターボックスの比率を定義
type LetterboxType = 'cinescope' | 'europianvista' | 'americanvista' | 'fullhd' | '';

const letterboxRatios: { [key in LetterboxType]: number } = {
  cinescope: 2.39,
  europianvista: 1.66,
  americanvista: 1.85,
  fullhd: 1.77,
  '': 1, // デフォルト値（レターボックスなし）
};

// 撮影範囲を計算する関数の引数の型を定義
type ShootingAreaProps = {
  sensorWidth: number;
  sensorHeight: number;
  focalLength: number;
  subjectDistance: number;
  subjectHeight: number;
  letterbox: LetterboxType;
};

// 撮影範囲を計算する関数
const calculateShootingArea = (
  sensorWidth: number,
  sensorHeight: number,
  focalLength: number,
  subjectDistance: number
): { width: number; height: number } => {
  // subjectDistance をメートルからミリメートルに変換
  const subjectDistanceMm = subjectDistance * 1000;

  // 撮影範囲の幅と高さをミリメートル単位で計算
  const width = (sensorWidth * subjectDistanceMm) / focalLength;
  const height = (sensorHeight * subjectDistanceMm) / focalLength;

  return { width, height };
};

// 視野角を計算する関数（水平方向）
const calculateFieldOfView = (focalLength: number, sensorWidth: number): number => {
  const fieldOfViewRadians = 2 * Math.atan(sensorWidth / (2 * focalLength));
  const fieldOfViewDegrees = fieldOfViewRadians * (180 / Math.PI);
  return fieldOfViewDegrees;
};

// 撮影範囲を表示するコンポーネント
function ShootingArea({ sensorWidth, sensorHeight, focalLength, subjectDistance, subjectHeight, letterbox }: ShootingAreaProps) {
  const boxRef = useRef<HTMLElement>(null);
  const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });
  const [mmToPxScale, setMmToPxScale] = useState(1);
  const [image] = useImage('/assets/human.svg');

  useEffect(() => {
    if (boxRef.current) {
      const { width, height } = boxRef.current.getBoundingClientRect();
      if (width !== boxSize.width || height !== boxSize.height) {
        setBoxSize({ width, height });
      }

      // 実際の撮影範囲のサイズを取得
      const shootingArea = calculateShootingArea(sensorWidth, sensorHeight, focalLength, subjectDistance);

      // スケーリングファクターを算出
      let mmToPxScale;
      if (sensorWidth >= sensorHeight) {
        // 横長の場合：幅を基準にスケーリング係数を計算
        mmToPxScale = boxSize.width / shootingArea.width;
      } else {
        // 縦長の場合：高さを基準にスケーリング係数を計算
        mmToPxScale = boxSize.height / shootingArea.height;
      }

      setMmToPxScale(mmToPxScale); // スケーリングファクターを状態として保持する

      const handleResize = () => {
        if (boxRef.current) {
          const { width, height } = boxRef.current.getBoundingClientRect();
          setBoxSize({ width, height });
        }
      };

      // ウィンドウリサイズ時のイベントリスナーを登録
      window.addEventListener('resize', handleResize);

      // コンポーネントのアンマウント時にイベントリスナーを削除
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [focalLength, sensorHeight, sensorWidth, subjectDistance, boxSize, boxRef]);

  const shootingArea = calculateShootingArea(sensorWidth, sensorHeight, focalLength, subjectDistance);

  const shootingAreaPx = {
    width: shootingArea.width * mmToPxScale,
    height: shootingArea.height * mmToPxScale,
  };

  const adjustLetterboxSize = (shootingAreaPx: { width: number; height: number }, letterboxRatio: number) => {
    let adjustedWidth, adjustedHeight;

    if (sensorWidth >= sensorHeight) {
      adjustedWidth = Math.max(shootingAreaPx.width, shootingAreaPx.height * letterboxRatio);
      adjustedHeight = Math.min(adjustedWidth / letterboxRatio, shootingAreaPx.height);
    } else {
      adjustedHeight = Math.max(shootingAreaPx.height, shootingAreaPx.width * letterboxRatio);
      adjustedWidth = Math.min(adjustedHeight / letterboxRatio, shootingAreaPx.width);
    }

    return { width: adjustedWidth, height: adjustedHeight };
  };

  // ステージのサイズに合わせてスケーリング
  const scale = Math.min(boxSize.width / shootingAreaPx.width, boxSize.height / shootingAreaPx.height);
  const scaledWidth = shootingAreaPx.width * scale;
  const scaledHeight = shootingAreaPx.height * scale;

  const subjectDisplayHeightPx = subjectHeight * 10 * mmToPxScale;

  const rectX = (boxSize.width - scaledWidth) / 2;
  const rectY = (boxSize.height - scaledHeight) / 2;

  // レターボックスの比率を取得
  const letterboxRatio = letterboxRatios[letterbox] || 1;

  // レターボックスのサイズを調整
  const adjustedLetterboxSize = adjustLetterboxSize(shootingAreaPx, letterboxRatio);

  // スケールの再計算
  const adjustedScale = Math.min(boxSize.width / adjustedLetterboxSize.width, boxSize.height / adjustedLetterboxSize.height);
  const adjustedScaledWidth = adjustedLetterboxSize.width * adjustedScale;
  const adjustedScaledHeight = adjustedLetterboxSize.height * adjustedScale;

  // ImageのX座標計算
  const imageX = rectX + scaledWidth / 2;

  // ImageのY座標の計算
  let imageY;
  let imageOffsetY;
  // レターボックスの選択有無によって計算方法を変更
  if (letterbox) {
    if (subjectDisplayHeightPx > adjustedScaledHeight) {
      // 被写体の高さがレターボックスの高さを超える場合、上に寄せる
      imageY = rectY + (scaledHeight - adjustedScaledHeight) / 2;
    } else {
      // そうでない場合、調整された撮影範囲で中央に配置
      imageY = rectY + (adjustedScaledHeight - subjectDisplayHeightPx) / 2 + (scaledHeight - adjustedScaledHeight) / 2;
    }
  } else {
    if (subjectDisplayHeightPx > scaledHeight) {
      // 被写体の高さが撮影範囲の高さを超える場合、上に寄せる
      imageY = rectY;
    } else {
      // そうでない場合、撮影範囲で中央に配置
      imageY = rectY + (scaledHeight - subjectDisplayHeightPx) / 2;
    }
  }

  // Imageのサイズとオフセット計算
  const imageWidth = subjectDisplayHeightPx * (image ? image.width / image.height : 1);
  const imageOffsetX = imageWidth / 2;

  return (
    <Box ref={boxRef} sx={{ width: '100%', height: '100%' }}>
      <Stage width={boxSize.width} height={boxSize.height}>
        <Layer>
          <Image
            image={image}
            x={imageX}
            y={imageY}
            width={imageWidth}
            height={subjectDisplayHeightPx}
            offsetX={imageOffsetX}
            offsetY={imageOffsetY}
          />
          <Rect x={rectX} y={rectY} width={scaledWidth} height={scaledHeight} stroke='#5a3fb5' strokeWidth={2} />
          {letterbox && (
            <Rect
              x={rectX + (scaledWidth - adjustedScaledWidth) / 2}
              y={rectY + (scaledHeight - adjustedScaledHeight) / 2}
              width={adjustedScaledWidth}
              height={adjustedScaledHeight}
              stroke='#ef5a5a'
              strokeWidth={2}
            />
          )}
        </Layer>
      </Stage>
    </Box>
  );
}

// RangeSliderPropsの型
interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  minRange: number;
  onChange: (event: Event, newValue: number | number[]) => void;
  onMaxIncrease: () => void;
  onMaxDecrease: () => void;
}

// レンジ切り替えスライダーコンポーネント
function RangeSlider({ min, max, value, step, minRange, onChange, onMaxIncrease, onMaxDecrease }: RangeSliderProps) {
  // marksの値を生成
  const sliderMarks = [
    {
      value: min,
      label: `${min}`,
    },
    {
      value: max,
      label: `${max}`,
    },
  ];

  const CustomSliderStyles = {
    marginBottom: '-0.8em',
    marginRight: '0.8em',
    '& .MuiSlider-markLabel': {
      marginTop: '-0.8em',
      color: '#5a3fb5',
      fontSize: '0.8em',
    },
  };

  return (
    <Stack direction='row' sx={{ width: '100%' }}>
      <Slider
        step={step}
        sx={CustomSliderStyles}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        valueLabelDisplay='auto'
        marks={sliderMarks}
      />
      <IconButton onClick={onMaxDecrease} disabled={max <= minRange} sx={{ marginTop: -0.5, color: '#5a3fb5' }}>
        <CloseFullscreenIcon fontSize='small' />
      </IconButton>
      <IconButton onClick={onMaxIncrease} disabled={max >= 1000} sx={{ marginTop: -0.5, color: '#5a3fb5' }}>
        <OpenInFullIcon fontSize='small' />
      </IconButton>
    </Stack>
  );
}

// アプリケーションのメインコンポーネント
const App = () => {
  const [sensorSize, setSensorSize] = useState<string>('35mm フルサイズ');
  const [sensorWidth, setSensorWidth] = useState<number>(36);
  const [sensorHeight, setSensorHeight] = useState<number>(24);
  const [focalLength, setFocalLength] = useState<number>(50);
  const [subjectDistance, setSubjectDistance] = useState<number>(2);
  const [subjectHeight, setSubjectHeight] = useState<number>(160);
  const [letterbox, setLetterbox] = useState<LetterboxType>('');
  const [shootingAreaSize, setShootingAreaSize] = useState({ width: 0, height: 0 });
  const [maxFocalLength, setMaxFocalLength] = useState<number>(100);
  const [maxSubjectDistance, setMaxSubjectDistance] = useState<number>(10);
  const [maxSubjectHeight, setMaxSubjectHeight] = useState<number>(200);
  const [fieldOfView, setFieldOfView] = useState<number>(0);

  // センサーサイズや焦点距離が変更されたときに撮影範囲を再計算
  useEffect(() => {
    const shootingArea = calculateShootingArea(sensorWidth, sensorHeight, focalLength, subjectDistance);
    setShootingAreaSize(shootingArea);
    const fov = calculateFieldOfView(focalLength, sensorWidth);
    setFieldOfView(fov);
  }, [sensorWidth, sensorHeight, focalLength, subjectDistance]);

  const handleSensorSizeChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const selectedSize = sensorSizes.find((size) => size.label === value);
    setSensorSize(value);
    if (selectedSize) {
      setSensorWidth(selectedSize.width);
      setSensorHeight(selectedSize.height);
    }
  };

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSensorWidth(Number(event.target.value));
    setSensorSize(''); // Selectの選択状態を解除
  };

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSensorHeight(Number(event.target.value));
    setSensorSize(''); // Selectの選択状態を解除
  };

  const handleSliderChange = (setValue: SetValueFunction) => {
    return debounce((_: Event, newValue: number | number[]) => {
      const value = Array.isArray(newValue) ? newValue[0] : newValue;
      setValue(value);
    }, 15); // 10ミリ秒のデバウンスを適用
  };

  const handleInputChange = (setValue: SetValueFunction) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? 0 : Number(event.target.value);
    setValue(value);
  };

  const handleLetterboxChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value as LetterboxType;
    setLetterbox(selectedValue);
  };

  const createRangeHandler = (setter: SetValueFunction, min: number, max: number, step: number) => (increase: boolean) => {
    setter((prevValue: number) => {
      const newValue = prevValue + (increase ? step : -step);
      return Math.min(Math.max(newValue, min), max);
    });
  };

  const handleMaxFocalLengthChange = createRangeHandler(setMaxFocalLength, 100, 1000, 100);
  const handleMaxSubjectDistanceChange = createRangeHandler(setMaxSubjectDistance, 10, 1000, 10);
  const handleMaxSubjectHeightChange = createRangeHandler(setMaxSubjectHeight, 100, 2000, 100);

  return (
    <Container sx={{ textAlign: 'center', justifyContent: 'center', width: '100%', padding: 2 }}>
      <Typography variant='h6' gutterBottom>
        レンズ何持ってく？
      </Typography>

      <Grid container justifyContent='center'>
        <Grid item>
          {/* キャンバス表示エリア */}
          <Box
            sx={{
              position: 'relative',
              padding: 2,
              marginBottom: 0,
              height: '45vh',
              width: '45vh',
              backgroundColor: '#ddd',
              // ビューポートの高さに基づいてサイズを変更
              '@media (max-aspect-ratio: 1/2)': {
                height: '95vw',
                width: '95vw',
              },
            }}
          >
            <ShootingArea
              sensorWidth={sensorWidth}
              sensorHeight={sensorHeight}
              focalLength={focalLength}
              subjectDistance={subjectDistance}
              subjectHeight={subjectHeight}
              letterbox={letterbox}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
                backgroundColor: 'transparent',
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* 撮影範囲の表示 */}
      <Typography variant={'body2'} sx={{ margintop: 0, marginBottom: 2 }}>
        撮影範囲: {(shootingAreaSize.width / 1000).toFixed(2)} m x {(shootingAreaSize.height / 1000).toFixed(2)} m | 視野角: {fieldOfView.toFixed(2)}°
      </Typography>

      {/* レンズ焦点距離 */}
      <Typography variant={'body2'} gutterBottom sx={{ marginBottom: -1 }}>
        レンズ焦点距離 (mm)
      </Typography>
      <Stack spacing={2} direction='row' alignItems='center'>
        <Input
          value={focalLength}
          size='small'
          sx={{ width: 60 }}
          onChange={handleInputChange(setFocalLength)}
          inputProps={{ step: 1, min: 0, max: 2000, type: 'number', 'aria-label': 'レンズ焦点距離' }}
        />
        <RangeSlider
          min={0}
          max={maxFocalLength}
          minRange={100}
          step={1}
          value={focalLength}
          onChange={handleSliderChange(setFocalLength)}
          onMaxIncrease={() => handleMaxFocalLengthChange(true)}
          onMaxDecrease={() => handleMaxFocalLengthChange(false)}
        />
      </Stack>

      {/* 被写体までの距離 */}
      <Typography gutterBottom variant={'body2'} sx={{ marginBottom: -1 }}>
        被写体までの距離 (m)
      </Typography>
      <Stack spacing={2} direction='row' alignItems='center'>
        <Input
          value={subjectDistance}
          size='small'
          sx={{ width: 60 }}
          onChange={handleInputChange(setSubjectDistance)}
          inputProps={{ step: 0.1, min: 0, max: 2000, type: 'number', 'aria-label': '被写体までの距離' }}
        />
        <RangeSlider
          min={0}
          max={maxSubjectDistance}
          minRange={10}
          step={0.1}
          value={subjectDistance}
          onChange={handleSliderChange(setSubjectDistance)}
          onMaxIncrease={() => handleMaxSubjectDistanceChange(true)}
          onMaxDecrease={() => handleMaxSubjectDistanceChange(false)}
        />
      </Stack>

      {/* 被写体の身長 */}
      <Typography gutterBottom variant={'body2'} sx={{ marginBottom: -1 }}>
        被写体の身長 (cm)
      </Typography>
      <Stack spacing={2} direction='row' alignItems='center'>
        <Input
          value={subjectHeight}
          size='small'
          sx={{ width: 60 }}
          onChange={handleInputChange(setSubjectHeight)}
          inputProps={{ step: 1, min: 0, max: 20000, type: 'number', 'aria-label': '被写体の身長' }}
        />
        <RangeSlider
          min={0}
          max={maxSubjectHeight}
          minRange={100}
          step={1}
          value={subjectHeight}
          onChange={handleSliderChange(setSubjectHeight)}
          onMaxIncrease={() => handleMaxSubjectHeightChange(true)}
          onMaxDecrease={() => handleMaxSubjectHeightChange(false)}
        />
      </Stack>

      {/* センサーサイズ */}
      <Grid container spacing={2} marginTop={2} marginBottom={2}>
        <Grid item xs={12} sm={6} md={6}>
          <FormControl fullWidth>
            <InputLabel>センサーサイズプリセット</InputLabel>
            <Select value={sensorSize} label='センサーサイズプリセット' onChange={handleSensorSizeChange}>
              {sensorSizes.map((size) => (
                <MenuItem key={size.label} value={size.label}>
                  {size.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <TextField fullWidth label='センサーサイズ 横 (mm)' value={sensorWidth} onChange={handleWidthChange} type='number' />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <TextField fullWidth label='センサーサイズ 縦 (mm)' value={sensorHeight} onChange={handleHeightChange} type='number' />
        </Grid>
      </Grid>

      {/* レターボックスプリセット */}
      <Box sx={{ marginBottom: 2 }}>
        <FormControl fullWidth>
          <InputLabel>ムービー/レターボックス</InputLabel>
          <Select value={letterbox} label='ムービー/レターボックス' onChange={handleLetterboxChange}>
            <MenuItem value=''>レターボックスなし</MenuItem>
            <MenuItem value='fullhd'>HD/ワイドムービー - 1.78:1 (16:9)</MenuItem>
            <MenuItem value='europianvista'>ヨーロピアンビスタ - 1.66:1</MenuItem>
            <MenuItem value='americanvista'>アメリカンビスタ - 1.85:1</MenuItem>
            <MenuItem value='cinescope'>シネマスコープ (アナモルフィック無し) - 2.35:1</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* クレジット */}
      <Stack spacing={0} sx={{ marginBottom: 2 }}>
        <Typography variant='caption' sx={{ marginTop: 2 }}>
          by Jun Murakami
        </Typography>
        <Typography variant='caption' sx={{ marginBottom: 2 }}>
          お問い合わせは <Link href='https://twitter.com/jun_murakami'> X(Twitter) </Link> または{' '}
          <Link href='https://note.com/junmurakami'> note </Link> まで
        </Typography>
      </Stack>
    </Container>
  );
};

export default App;
