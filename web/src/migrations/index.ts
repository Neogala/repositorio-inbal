import * as migration_20261007_001439_inicial from './20261007_001439_inicial';
import * as migration_20261007_003010_privacidad_media from './20261007_003010_privacidad_media';
import * as migration_20261007_003548_busqueda_trigramas from './20261007_003548_busqueda_trigramas';
import * as migration_20261007_004540_media_zoom from './20261007_004540_media_zoom';
import * as migration_20261007_173348_usuarios_activo from './20261007_173348_usuarios_activo';
import * as migration_20261022_023948_almacenamiento_s3 from './20261022_023948_almacenamiento_s3';

export const migrations = [
  {
    up: migration_20261007_001439_inicial.up,
    down: migration_20261007_001439_inicial.down,
    name: '20261007_001439_inicial',
  },
  {
    up: migration_20261007_003010_privacidad_media.up,
    down: migration_20261007_003010_privacidad_media.down,
    name: '20261007_003010_privacidad_media',
  },
  {
    up: migration_20261007_003548_busqueda_trigramas.up,
    down: migration_20261007_003548_busqueda_trigramas.down,
    name: '20261007_003548_busqueda_trigramas',
  },
  {
    up: migration_20261007_004540_media_zoom.up,
    down: migration_20261007_004540_media_zoom.down,
    name: '20261007_004540_media_zoom',
  },
  {
    up: migration_20261007_173348_usuarios_activo.up,
    down: migration_20261007_173348_usuarios_activo.down,
    name: '20261007_173348_usuarios_activo',
  },
  {
    up: migration_20261022_023948_almacenamiento_s3.up,
    down: migration_20261022_023948_almacenamiento_s3.down,
    name: '20261022_023948_almacenamiento_s3'
  },
];
