import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
  NotFoundException,
  UseFilters,
} from '@nestjs/common';
import { Response } from 'express';
import { DeviceTypesService } from './device-types.service';
import { CreateDeviceTypeDto } from './dto/create-device-type.dto';
import { UpdateDeviceTypeDto } from './dto/update-device-type.dto';
import { DeviceType } from './models/device-type.model';
import { Types } from 'mongoose';
import { CustomExceptionFilter } from 'src/device-types/filters/custom-exception.filter';
import { JwtAuth } from 'src/login/decorator/jwt.auth.decorator';
import { Role } from 'src/login/enum/roles.enum';
import { Roles } from 'src/login/decorator/roles.decorator';

@Controller('type')
@UseFilters(CustomExceptionFilter)
@JwtAuth()
export class DeviceTypesController {
  constructor(private readonly typeService: DeviceTypesService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() createDto: CreateDeviceTypeDto,
    @Res() response: Response,
  ): Promise<void> {
    const type = await this.typeService.create(createDto);
    const locationUri = `/Device_Type/${type.id}`;
    response.setHeader('Location', locationUri);
    response.status(HttpStatus.CREATED).send(type);
  }

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  public async findAll(): Promise<DeviceType[]> {
    const type = await this.typeService.findAll();
    return type;
  }

  @Get(':param')
  @Roles(Role.OWNER, Role.ADMIN)
  async findOne(@Param('param') param: string) {
    const parsedParam = Types.ObjectId.isValid(param) ? param : null;
    const index = !parsedParam ? parseInt(param, 10) : null;

    if (parsedParam) {
      return await this.typeService.findById(parsedParam);
    } else if (!isNaN(index) && index >= 1) {
      return await this.typeService.findByIndex(index);
    } else {
      throw new NotFoundException(
        `Nenhum type encontrado para o parâmetro ${param}`,
      );
    }
  }

  @Patch(':param')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param('param') param: string,
    @Body() updateDto: UpdateDeviceTypeDto,
  ): Promise<DeviceType> {
    const parsedParam = Types.ObjectId.isValid(param) ? param : null;
    const index = !parsedParam ? parseInt(param, 10) : null;

    if (parsedParam) {
      return await this.typeService.updateById(parsedParam, updateDto);
    } else if (!isNaN(index) && index >= 1) {
      return await this.typeService.updateByIndex(index, updateDto);
    } else {
      throw new NotFoundException(
        `Nenhum type encontrado para o parâmetro ${param}`,
      );
    }
  }

  @Delete(':param')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('param') param: string): Promise<void> {
    const parsedParam = Types.ObjectId.isValid(param) ? param : null;
    const index = !parsedParam ? parseInt(param, 10) : null;

    if (parsedParam) {
      await this.typeService.deleteById(parsedParam);
    } else if (!isNaN(index) && index >= 1) {
      await this.typeService.deleteByIndex(index);
    } else {
      throw new NotFoundException(
        `Nenhum type encontrado para o parâmetro ${param}`,
      );
    }
  }
}
